export abstract class StaticController {
  public abstract init(): void
}


export abstract class StatefulController extends StaticController {
  public abstract start(): void
  public abstract stop(): void
}
