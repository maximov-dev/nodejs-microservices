import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { getMongoConfig } from "../configs/mongo.config";

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: 'environments/.account.env'
  }
  ),
  MongooseModule.forRootAsync(getMongoConfig())
  ]
})
export class CoreModule {}
