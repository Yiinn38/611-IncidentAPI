import { envs } from 'src/config/envs';
import { Incident } from 'src/core/entities/incident.entity';
import { LostPet } from 'src/core/entities/lost-pet.entity';
import { FoundPet } from 'src/core/entities/found-pet.entity';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  host: envs.DB_HOST,
  database: envs.DB_NAME,
  username: envs.DB_USER,
  password: envs.DB_PASSWORD,
  port: envs.DB_PORT,
  type: 'postgres',
  entities: [Incident, LostPet, FoundPet],
  synchronize: false,
  migrations: ['dist/core/db/migrations/[0-9]*-*.js'],
};

export const dataSource = new DataSource(dataSourceOptions);
