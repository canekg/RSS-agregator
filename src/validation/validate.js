import * as yup from 'yup';
import { setLocale } from 'yup';

const validate = (i18n, url) => {
  setLocale({
    mixed: {
      default: 'field_invalid',
    },
    string: {
      url: i18n.t('validation.errors.errorURL'),
      min: i18n.t('validation.errors.errorRequared'),
    },
  });

  const urlSchema = yup.string().url().min(1);

  return urlSchema.validate(url);
};
export default validate;
