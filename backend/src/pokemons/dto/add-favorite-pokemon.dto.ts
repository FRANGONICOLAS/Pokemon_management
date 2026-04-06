import { IsNotEmpty, IsString } from 'class-validator';

export class AddFavoritePokemonDto {
  @IsString()
  @IsNotEmpty()
  pokemon!: string;
}
