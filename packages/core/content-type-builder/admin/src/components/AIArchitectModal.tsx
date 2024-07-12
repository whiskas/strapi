import { ArrowClockwise, Sparkle } from '@strapi/icons';
import * as React from 'react';
import { useRef, useState, useEffect } from 'react';

import { Form, useFetchClient, useNotification } from '@strapi/admin/strapi-admin';
import {
  Box,
  Button,
  Field,
  Flex,
  Modal,
  Table,
  Tbody,
  TextInput,
  Th,
  Thead,
  Tr,
  Typography,
} from '@strapi/design-system';
import { useNavigate } from 'react-router-dom';
import { keyframes, styled } from 'styled-components';

import { useDataManager } from '../hooks/useDataManager';
import { useFormModalNavigation } from '../hooks/useFormModalNavigation';
import { pluginId } from '../pluginId';

import { AttributeIcon } from './AttributeIcon';
import { DisplayedType } from './DisplayedType';
import { toAttributesArray } from './DataManagerProvider/utils/formatSchemas';

import type { Struct, UID } from '@strapi/types';

export interface AIArchitectModalProps {}

export const AIArchitectModal: React.FC<AIArchitectModalProps> = () => {
  // Utils
  const navigate = useNavigate();
  const { post } = useFetchClient();
  const { toggleNotification } = useNotification();

  // State Providers
  const { isAIModalOpen, onOpenModalAIArchitect, onCloseModalAIArchitect } =
    useFormModalNavigation();
  const { createSchema, toggleAI } = useDataManager();

  // Local State
  const [prompt, setPrompt] = useState<string>('');
  const [schema, setSchema] = useState<any>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading, inputRef]);

  /**
   * Callback function for modal visibility change.
   *
   * @param open - Indicates whether the modal is open or closed.
   */
  const onModalChangeVisibility = (open: boolean) => {
    if (open) {
      onOpenModalAIArchitect();
    } else {
      onCloseModalAIArchitect();
    }
  };

  /**
   * A function that generates a schema based on the given prompt and schema.
   *
   * It sets the loading state to true, then makes a POST request to the server with the provided prompt and schema.
   *
   * If a valid schema is returned from the server, it sets the schema state to the received data.
   *
   * If an error occurs during the POST request, it logs the error to the console and triggers a notification.
   *
   * Finally, it sets the loading state to false.
   */
  const onGenerate = async () => {
    setLoading(true);

    try {
      const { data } = await post<Struct.ContentTypeSchema>(`/${pluginId}/architect`, {
        prompt,
        schema,
      });

      // If a valid schema is returned
      setSchema(data);
      setPrompt('');
    } catch {
      toggleNotificationFailedToGenerateSchema();
    }

    setLoading(false);
  };

  const onContinue = async () => {
    if (!schema) {
      return;
    }

    toggleAI();

    const formattedSchema = formatSchema(schema);
    const { singularName } = formattedSchema;

    const uid = `api::${singularName}.${singularName}` satisfies UID.Schema;

    createSchema(formattedSchema, 'contentType', uid);

    navigate({ pathname: `/plugins/content-type-builder/content-types/${uid}` });

    onCloseModalAIArchitect();
  };

  const formatSchema = (x: Struct.ContentTypeSchema) => ({
    kind: x.kind,
    draftAndPublish: x.options?.draftAndPublish,
    pluginOptions: x.pluginOptions,
    ...x.info,
    attributes: toAttributesArray(x.attributes),
  });

  const toggleNotificationFailedToGenerateSchema = () => {
    toggleNotification({
      type: 'danger',
      message: 'Failed to generate a valid schema, please try again or change your prompt',
    });
  };

  return (
    <Modal.Root open={isAIModalOpen} onOpenChange={onModalChangeVisibility}>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>✨ AI Architect</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form method="POST" onSubmit={onGenerate}>
            <Flex width="100%" gap="20px" alignItems="baseline">
              <Field.Root
                name="prompt"
                hint={
                  schema === undefined
                    ? 'Example: Create a user with auth capabilities and an about me section'
                    : 'Example: Add a manager field'
                }
                width="100%"
              >
                <TextInput
                  ref={inputRef}
                  autoFocus
                  type="text"
                  name="prompt"
                  placeholder={
                    schema === undefined
                      ? 'What do you want to create today?'
                      : "Is there anything you'd like to modify?"
                  }
                  disabled={loading}
                  value={prompt}
                  onChange={(e) => {
                    e.preventDefault();
                    setPrompt(e.target.value);
                  }}
                />
                <Field.Hint />
              </Field.Root>
              <Button
                type="submit"
                disabled={!prompt || loading}
                startIcon={loading ? <Loader /> : <Sparkle width="3rem" />}
              >
                {schema === undefined ? 'Generate' : 'Update'}
              </Button>
            </Flex>
          </Form>
          {schema !== undefined && <SchemaPreview schema={schema} />}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onCloseModalAIArchitect} variant="danger-light">
            Cancel
          </Button>
          <Button onClick={onContinue} disabled={!schema || loading}>
            Continue
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};

interface SchemaPreviewProps {
  schema: Struct.ContentTypeSchema;
}

const BoxWrapper = styled(Box)`
  position: relative;
`;

const rotation = keyframes`
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(359deg);
    }
  `;

const LoaderReload = styled(ArrowClockwise)`
  animation: ${rotation} 1s infinite linear;
`;

const Loader: React.FC = () => <LoaderReload width="3rem" />;

const SchemaPreview: React.FC<SchemaPreviewProps> = ({ schema }) => {
  const { info, attributes } = schema;

  const attributeCount = Object.keys(attributes).length;

  return (
    <Flex marginTop="25px" direction="column" alignItems="left" gap={3}>
      <Box width="100%">
        <Box>
          <Typography variant="beta">{info.displayName}</Typography>
        </Box>
        <Box>
          <Typography variant="sigma">{info.description}</Typography>
        </Box>
      </Box>
      <Table colCount={2} rowCount={attributeCount} width="100%">
        <Thead>
          <Tr>
            <Th>
              <Typography variant="sigma" textColor="neutral600">
                Name
              </Typography>
            </Th>
            <Th>
              {' '}
              <Typography variant="sigma" textColor="neutral600">
                Type
              </Typography>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {Object.entries(attributes).map(([name, attribute]) => {
            return (
              <BoxWrapper tag="tr" key={name}>
                <td>
                  <Flex paddingLeft={2} gap={3}>
                    <AttributeIcon type={attribute.type} />
                    <Typography fontWeight="bold">{name}</Typography>
                  </Flex>
                </td>
                <td>
                  <DisplayedType type={attribute.type} />
                </td>
              </BoxWrapper>
            );
          })}
        </Tbody>
      </Table>
    </Flex>
  );
};
