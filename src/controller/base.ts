export abstract class StaticController {
  public abstract init(): void
}


export abstract class StatefulController {
  public abstract init(): void
  public abstract start(): void
  public abstract stop(): void
}


export class Mail {
  public readonly to: string;
  public readonly subject: string;
  public readonly htmlBody: string;
}
