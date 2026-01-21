import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    @Inject('REDIS_DB') private readonly redis: Redis, // Inject the "Filing Cabinet"
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = request.cookies['session_id'];
    if (!sessionId) return false;

    // Ask Redis: "Is this session valid?"
    const userData = await this.redis.get(sessionId)
    if (!userData) return false;

    // Attach user info to the request for the controller to use
    request.user = {id: userData};
    return true;
  }
}