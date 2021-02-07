import traverse from 'traverse';

const raDateFormat = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]/g;

export const sanitizeProps = (obj: any) => {
  const modified = Array.isArray(obj) ? [...obj] : { ...obj };

  traverse(modified).forEach(function(val) {
    if (
      typeof val === 'string' &&
      val.match(/^-?(0|[1-9]\d*)(\.\d+)?$/) &&
      !this?.key?.toLowerCase()?.includes('title')
    ) {
      this.update(Number(val));
    } else if (typeof val === 'string' && val.match(raDateFormat)) {
      this.update(new Date(val));
    }
  });

  return modified;
};
