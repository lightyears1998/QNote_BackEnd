import { CronJob } from "cron";
import { logger } from "..";
import { StatefulController } from "./base";
import { emailVerificationController } from "./EmailVerificationController";


/**
 * 定时任务管理器
 *
 * 在 QNote Backend 中一些任务需要定期运行，例如：
 *
 * - 定期清理垃圾；
 * - 定期运行数据整理任务，以保证 NoSQL 数据库中数据的一致性；
 * - 定期运行其他用于保持系统健康的必要的定时任务。
 *
 * 所有需要定期运行的任务均通过 Scheduler 进行管理。
 */
export class Scheduler extends StatefulController {
  private cronJobs: Array<CronJob> = [];

  public init(): void {
    this.schedule(emailVerificationController.recycleVerificationCodes, "0 0 */6 * * *");
  }

  public schedule(task: () => Promise<void> | void, cronTime: string): void {
    const job = new CronJob(cronTime, async () => {
      await task();
      this.reportEstimatedNextExecutionTime(task.name, job);
    });
    this.cronJobs.push(job);

    this.reportEstimatedNextExecutionTime(task.name, job);
  }

  private reportEstimatedNextExecutionTime(taskname: string, job: CronJob) {
    logger.info({
      label:   "定时任务",
      message: `预计下次运行 ${taskname} 的时间是 ${job.nextDate().toLocaleString()}。`
    });
  }

  public start(): void {
    this.cronJobs.forEach(job => job.start());
  }

  public stop(): void {
    this.cronJobs.forEach(job => job.stop());
  }
}


export const scheduler = new Scheduler();
