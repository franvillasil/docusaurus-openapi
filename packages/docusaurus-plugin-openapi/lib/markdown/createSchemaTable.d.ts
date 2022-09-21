import { MediaTypeObject } from "../openapi/types";
interface Props {
  style?: any;
  title: string;
  body: {
    content?: {
      [key: string]: MediaTypeObject;
    };
    description?: string;
    required?: boolean;
  };
}
export declare function createSchemaTable({
  title,
  body,
  ...rest
}: Props): string | undefined;
export {};
