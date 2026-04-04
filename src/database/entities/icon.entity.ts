import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('icons')
export class Icon {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ unique: true })
  name: string;

  @Index()
  @Column()
  label: string;

  @Column('simple-array', { nullable: true })
  tags: string[];
}
