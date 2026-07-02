import { ContainerClient } from '@azure/storage-blob';
import { MESSAGE } from 'triple-beam';
import Transport, { TransportStreamOptions } from 'winston-transport';

const DEFAULT_MAX_BYTES = 50 * 1024 * 1024;

interface AzureBlobTransportOptions extends TransportStreamOptions {
	containerClient: ContainerClient;
	folder: string;
	maxBytes?: number;
}

interface BlobState {
	date: string;
	suffix: number;
	blobName: string;
	sizeBytes: number;
}

// Appends newline-delimited JSON straight to an Azure Append Blob — no local
// file is ever created. State (current blob/size for today) is resolved from
// blob storage itself on the first write of each day, so a process restart
// resumes the existing file instead of starting a new one.
export class AzureBlobTransport extends Transport {
	private readonly containerClient: ContainerClient;
	private readonly folder: string;
	private readonly maxBytes: number;
	private state: BlobState | null = null;
	private writeChain: Promise<void> = Promise.resolve();

	constructor(opts: AzureBlobTransportOptions) {
		super(opts);
		this.containerClient = opts.containerClient;
		this.folder = opts.folder;
		this.maxBytes = opts.maxBytes ?? DEFAULT_MAX_BYTES;
	}

	log(info: any, callback: () => void) {
		const line = String(info[MESSAGE]);
		this.writeChain = this.writeChain.then(() => this.append(line)).catch((err) => {
			// eslint-disable-next-line no-console
			console.error(`[AzureBlobTransport:${this.folder}] failed to write log entry`, err);
		});
		this.writeChain.then(() => callback());
	}

	private async append(line: string): Promise<void> {
		const buffer = Buffer.from(line + '\n', 'utf8');
		await this.ensureState(buffer.length);

		const blobClient = this.containerClient.getAppendBlobClient(this.state!.blobName);
		await blobClient.appendBlock(buffer, buffer.length);
		this.state!.sizeBytes += buffer.length;
	}

	private async ensureState(incomingBytes: number): Promise<void> {
		const today = new Date().toISOString().slice(0, 10);

		if (!this.state || this.state.date !== today) {
			this.state = await this.resolveStateForDate(today);
		}

		if (this.state.sizeBytes + incomingBytes > this.maxBytes) {
			this.state = await this.createBlobState(today, this.state.suffix + 1);
		}
	}

	private async resolveStateForDate(date: string): Promise<BlobState> {
		let highestSuffix = -1;
		let sizeOfHighest = 0;

		for await (const blob of this.containerClient.listBlobsFlat({ prefix: `${this.folder}/${date}` })) {
			const match = blob.name.match(/-(\d{3})\.log$/);
			const suffix = match ? parseInt(match[1], 10) : 0;
			if (suffix > highestSuffix) {
				highestSuffix = suffix;
				sizeOfHighest = blob.properties.contentLength ?? 0;
			}
		}

		if (highestSuffix === -1) {
			return this.createBlobState(date, 0);
		}

		if (sizeOfHighest >= this.maxBytes) {
			return this.createBlobState(date, highestSuffix + 1);
		}

		return { date, suffix: highestSuffix, blobName: this.blobNameFor(date, highestSuffix), sizeBytes: sizeOfHighest };
	}

	private async createBlobState(date: string, suffix: number): Promise<BlobState> {
		const blobName = this.blobNameFor(date, suffix);
		await this.containerClient.getAppendBlobClient(blobName).createIfNotExists();
		return { date, suffix, blobName, sizeBytes: 0 };
	}

	private blobNameFor(date: string, suffix: number): string {
		return suffix === 0 ? `${this.folder}/${date}.log` : `${this.folder}/${date}-${String(suffix).padStart(3, '0')}.log`;
	}
}
