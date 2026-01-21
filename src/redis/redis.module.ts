    import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global() // This makes it visible to EVERY planet (module)
@Module({
  providers: [
    {
      provide: 'REDIS_DB',
      useFactory: () => {
        return new Redis({
          host: 'localhost',
          port: 6379,
        });
      },
    },
  ],
  exports: ['REDIS_DB'], // This allows the "REDIS_DB" tool to be used outside
})
export class RedisModule {}