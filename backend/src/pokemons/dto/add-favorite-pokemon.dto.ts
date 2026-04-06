import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AddFavoritePokemonDto {
  @IsString()
  @IsNotEmpty()
  pokemon!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comments?: string;
}
