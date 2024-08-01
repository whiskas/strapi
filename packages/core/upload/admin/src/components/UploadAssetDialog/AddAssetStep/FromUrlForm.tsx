import * as React from 'react';

import { useTracking } from '@strapi/admin/strapi-admin';
import { Box, Button, Field, Modal, Textarea } from '@strapi/design-system';
import { Form, Formik } from 'formik';
import { useIntl } from 'react-intl';
// TODO: replace with the import from the constants file when the file is migrated to TypeScript
import { AssetSource, AssetType } from '../../../newConstants';

// TODO: to replace with the import from utils when the index is migrated to TypeScript
import { getTrad } from '../../../utils/getTrad';
import { urlsToAssets } from '../../../utils/urlsToAssets';
import { urlSchema } from '../../../utils/urlYupSchema';

type Assets = {
  source: AssetSource;
  name: string;
  type?: AssetType;
  url: string;
  ext?: string;
  mime?: string | null;
  rawFile: File;
}[];

interface FromUrlFormProps {
  onClose: () => void;
  onAddAsset: (assets: Assets) => void;
  trackedLocation?: string;
}

export const FromUrlForm = ({ onClose, onAddAsset, trackedLocation }: FromUrlFormProps) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>(undefined);
  const { formatMessage } = useIntl();
  const { trackUsage } = useTracking();

  const handleSubmit = async ({ urls }: { urls: string }) => {
    setLoading(true);
    const urlArray = urls.split(/\r?\n/);
    try {
      const assets = await urlsToAssets(urlArray);

      if (trackedLocation) {
        trackUsage('didSelectFile', { source: 'url', location: trackedLocation });
      }

      // no need to set the loading to false since the component unmounts
      onAddAsset(assets);
    } catch (e) {
      setError(e as Error);
      setLoading(false);
    }
  };

  return (
    <Formik
      enableReinitialize
      initialValues={{
        urls: '',
      }}
      onSubmit={handleSubmit}
      validationSchema={urlSchema}
      validateOnChange={false}
    >
      {({ values, errors, handleChange }) => (
        <Form noValidate>
          <Box paddingLeft={8} paddingRight={8} paddingBottom={6} paddingTop={6}>
            <Field.Root
              name="urls"
              hint={formatMessage({
                id: getTrad('input.url.description'),
                defaultMessage: 'Separate your URL links by a carriage return.',
              })}
              error={
                error?.message ||
                (errors.urls
                  ? formatMessage({ id: errors.urls, defaultMessage: 'An error occured' })
                  : undefined)
              }
            >
              <Field.Label>
                {formatMessage({ id: getTrad('input.url.label'), defaultMessage: 'URL' })}
              </Field.Label>
              <Textarea onChange={handleChange} value={values.urls} />
              <Field.Hint />
              <Field.Error />
            </Field.Root>
          </Box>

          <Modal.Footer>
            <Button onClick={onClose} variant="tertiary">
              {formatMessage({ id: 'app.components.Button.cancel', defaultMessage: 'cancel' })}
            </Button>
            <Button type="submit" loading={loading}>
              {formatMessage({
                id: getTrad('button.next'),
                defaultMessage: 'Next',
              })}
            </Button>
          </Modal.Footer>
        </Form>
      )}
    </Formik>
  );
};