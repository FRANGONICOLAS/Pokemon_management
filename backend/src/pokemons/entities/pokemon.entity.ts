import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserFavoritePokemon } from './user-favorite-pokemon.entity';

@Entity()
export class Pokemon {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  pokeApiId!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  spriteUrl!: string | null;

  @Column({ type: 'simple-array', default: '' })
  types!: string[];

  @OneToMany(() => UserFavoritePokemon, (favorite) => favorite.pokemon)
  favorites!: UserFavoritePokemon[];
}
