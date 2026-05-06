import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoundPet } from 'src/core/entities/found-pet.entity';
import { LostPet } from 'src/core/entities/lost-pet.entity';
import { FoundPetCDto } from 'src/core/models/found-pet.model';
import { CacheService } from 'src/cache/cache.service';
import { LostPetsService } from 'src/lost-pets/lost-pets.service';
import { logger } from 'src/config/logger';

const CACHE_KEY = 'found-pets:all';
const RADIUS_METERS = 500;

@Injectable()
export class FoundPetsService {
  constructor(
    @InjectRepository(FoundPet)
    private readonly foundPetRepository: Repository<FoundPet>,
    private readonly cacheService: CacheService,
    private readonly lostPetsService: LostPetsService,
  ) {}

  async findAll(): Promise<FoundPet[]> {
    try {
      const cached = await this.cacheService.get<FoundPet[]>(CACHE_KEY);
      if (cached && cached.length > 0) {
        logger.info('[FoundPetsService] findAll → cache hit');
        return cached;
      }

      const result = await this.foundPetRepository.find({
        order: { created_at: 'DESC' },
      });
      logger.info(`[FoundPetsService] findAll → DB: ${result.length} registros`);
      await this.cacheService.set(CACHE_KEY, result);
      return result;
    } catch (error) {
      logger.error('[FoundPetsService] Error en findAll');
      logger.error(error);
      return [];
    }
  }

  async create(dto: FoundPetCDto): Promise<{
    foundPet: FoundPet;
    nearbyLostPets: LostPet[];
  }> {
    const entity = this.foundPetRepository.create({
      description: dto.description,
      contact_phone: dto.contact_phone,
      location: {
        type: 'Point',
        coordinates: [dto.lon, dto.lat],
      },
    });

    const foundPet = await this.foundPetRepository.save(entity);
    await this.cacheService.delete(CACHE_KEY);

    logger.info(`[FoundPetsService] Mascota encontrada creada id=${foundPet.id}`);
    logger.info(`[FoundPetsService] Buscando mascotas perdidas en ${RADIUS_METERS}m...`);

    const nearbyLostPets = await this.lostPetsService.findInRadius(
      dto.lat,
      dto.lon,
      RADIUS_METERS,
    );

    logger.info(
      `[FoundPetsService] Se encontraron ${nearbyLostPets.length} mascota(s) perdida(s) cercana(s)`,
    );

    return { foundPet, nearbyLostPets };
  }
}
