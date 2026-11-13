import Ajv from 'ajv';
import bookingSchema from '../test-data/api/restful-booker/schemas/booking.schema.json';
import createBookingSchema from '../test-data/api/restful-booker/schemas/createBooking.schema.json';
import postSchema from '../test-data/api/jsonplaceholder/schemas/post.schema.json';
import commentSchema from '../test-data/api/jsonplaceholder/schemas/comment.schema.json';
import todoSchema from '../test-data/api/jsonplaceholder/schemas/todo.schema.json';
import albumSchema from '../test-data/api/jsonplaceholder/schemas/album.schema.json';
import userSchema from '../test-data/api/jsonplaceholder/schemas/user.schema.json';

const ajv = new Ajv({ allErrors: true });
[bookingSchema, createBookingSchema, postSchema, commentSchema, todoSchema, albumSchema, userSchema].forEach((s) =>
  ajv.addSchema(s),
);

/** Validates a response body against a JSON schema (contract testing). Returns readable errors, or [] if valid. */
export function validateSchema(name: string, body: unknown): string[] {
  const validate = ajv.getSchema(name);
  if (!validate) throw new Error(`Schema "${name}" is not registered`);
  validate(body);
  return (validate.errors ?? []).map((e) => `${e.instancePath || '/'} ${e.message}`);
}
