import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoundPet } from 'src/core/entities/found-pet.entity';
import { CacheModule } from 'src/cache/cache.module';
import { LostPetsModule } from 'src/lost-pets/lost-pets.module';
import { FoundPetsController } from './found-pets.controller';
import { FoundPetsService } from './found-pets.service';

@Module({
  imports: [TypeOrmModule.forFeature([FoundPet]), CacheModule, LostPetsModule],
  controllers: [FoundPetsController],
  providers: [FoundPetsService],
})
export class FoundPetsModule {}
