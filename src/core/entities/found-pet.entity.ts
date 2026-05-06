import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { Point } from 'typeorm';

@Entity('found_pets')
export class FoundPet {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  description!: string;

  @Column()
  contact_phone!: string;

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  location!: Point;

  @CreateDateColumn()
  created_at!: Date;
}
