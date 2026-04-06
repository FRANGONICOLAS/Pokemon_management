import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Pokemon } from './pokemon.entity';

@Entity()
@Unique(['user', 'pokemon'])
export class UserFavoritePokemon {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.favoritePokemons, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.favorites, {
    nullable: false,
  })
  @JoinColumn({ name: 'pokemonId' })
  pokemon!: Pokemon;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'text', nullable: true })
  comments!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
