import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserFavoritePokemon } from '../../pokemons/entities/user-favorite-pokemon.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 500 })
  name!: string;

  @Column({ unique: true, nullable: false })
  email!: string;

  @Column({ nullable: false })
  password!: string;

  @OneToMany(() => UserFavoritePokemon, (favorite) => favorite.user)
  favoritePokemons!: UserFavoritePokemon[];
}