import { ApiProperty } from '@nestjs/swagger';

export class UserReactionsDTO {
  @ApiProperty({
    description: 'Map of comment IDs to reaction types',
    example: {
      '60d21b4667d0d8992e610c85': 'Like',
      '60d21b4667d0d8992e610c86': 'Dislike'
    },
    type: 'object',
    additionalProperties: {
      type: 'string',
      enum: ['Like', 'Dislike']
    }
  })
  commentReactions: Record<string, string>;

  @ApiProperty({
    description: 'Map of reply IDs to reaction types',
    example: {
      '60d21b4667d0d8992e610c87': 'Like',
      '60d21b4667d0d8992e610c88': 'Dislike'
    },
    type: 'object',
    additionalProperties: {
      type: 'string',
      enum: ['Like', 'Dislike']
    }
  })
  replyReactions: Record<string, string>;
}
