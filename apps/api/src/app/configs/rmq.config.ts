import { IRMQServiceAsyncOptions } from "nestjs-rmq";
import { ConfigModule, ConfigService } from "@nestjs/config";

export const getRMQConfig = (): IRMQServiceAsyncOptions => {
  return {
    inject: [ConfigService],
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => {
      return {
        exchangeName: configService.get('AMQP_EXCHANGE') ?? '',
        connections: [
          {
            login: configService.get('AMQP_USER') ?? '',
            password: configService.get('AMQP_PASSWORD') ?? '',
            host: configService.get('AMQP_HOSTNAME') ?? '',
          }
        ],
        prefetchCount: 20,
        serviceName: 'test-service'
      }
    }
  }
};
