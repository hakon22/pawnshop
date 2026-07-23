import { Module } from '@nestjs/common';

import { ClientController } from '@api/modules/client/controllers/client.controller';
import { ClientQueryService } from '@api/modules/client/services/client-query.service';
import { ClientService } from '@api/modules/client/services/client.service';

@Module({
  controllers: [ClientController],
  providers: [ClientService, ClientQueryService],
  exports: [ClientService],
})
export class ClientModule {}
