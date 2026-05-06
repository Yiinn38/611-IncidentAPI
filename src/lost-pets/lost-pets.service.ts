import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LostPet } from 'src/core/entities/lost-pet.entity';
import { LostPetCDto } from 'src/core/models/lost-pet.model';
import { CacheService } from 'src/cache/cache.service';
import { logger } from 'src/config/logger';

const CACHE_KEY = 'lost-pets:all';

@Injectable()
export class LostPetsService {
  constructor(
    @InjectRepository(LostPet)
    private readonly lostPetRepository: Repository<LostPet>,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(): Promise<LostPet[]> {
    try {
      const cached = await this.cacheService.get<LostPet[]>(CACHE_KEY);
      if (cached && cached.length > 0) {
        logger.info('[LostPetsService] findAll → cache hit');
        return cached;
      }

      const result = await this.lostPetRepository.find({
        where: { is_active: true },
        order: { created_at: 'DESC' },
      });
      logger.info(`[LostPetsService] findAll → DB: ${result.length} registros`);
      await this.cacheService.set(CACHE_KEY, result);
      return result;
    } catch (error) {
      logger.error('[LostPetsService] Error en findAll');
      logger.error(error);
      return [];
    }
  }

  async findInRadius(lat: number, lon: number, radiusMeters: number): Promise<LostPet[]> {
    return this.lostPetRepository
      .createQueryBuilder('lp')
      .where(
        `ST_DWithin(
          lp.location::geography,
          ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
          :radius
        )`,
        { lat, lon, radius: radiusMeters },
      )
      .andWhere('lp.is_active = true')
      .getMany();
  }

  async create(dto: LostPetCDto): Promise<LostPet> {
    const entity = this.lostPetRepository.create({
      pet_name: dto.pet_name,
      species: dto.species,
      description: dto.description,
      contact_phone: dto.contact_phone,
      location: {
        type: 'Point',
        coordinates: [dto.lon, dto.lat],
      },
    });

    const saved = await this.lostPetRepository.save(entity);
    await this.cacheService.delete(CACHE_KEY);
    logger.info(`[LostPetsService] Mascota perdida creada id=${saved.id}`);
    return saved;
  }
}
