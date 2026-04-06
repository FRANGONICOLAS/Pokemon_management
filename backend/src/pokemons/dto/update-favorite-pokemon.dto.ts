import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFavoritePokemonDto {
  @IsString()
  @IsNotEmpty()
  pokemon!: string;
}
