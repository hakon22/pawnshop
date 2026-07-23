import { Module } from '@nestjs/common';

import { InfrastructureModule } from '@infrastructure/infrastructure.module';

import { CatalogModule } from '@api/modules/catalog/catalog.module';
import { ClientModule } from '@api/modules/client/client.module';
import { PledgeModule } from '@api/modules/pledge/pledge.module';

@Module({
  imports: [
    InfrastructureModule,
    CatalogModule,
    ClientModule,
    PledgeModule,
  ],
})
export class AppModule {}
