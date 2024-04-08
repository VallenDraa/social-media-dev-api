import Joi from 'joi';
import { paginateValidator } from './paginate.validator';

export const friendRequestValidator = Joi.object({
	userId: Joi.string().trim().uuid().required(),
	friendId: Joi.string().trim().uuid().required(),
}).label('FriendRequest');

export const searchFriendValidator = paginateValidator
	.append({ 'with-user-data': Joi.boolean().example(false) })
	.label('SearchFriend');
