export abstract class StaticController {
  public abstract init(): void
}


export class Mail {
  public readonly to: string;
  public readonly subject: string;
  public readonly htmlBody: string;
}
