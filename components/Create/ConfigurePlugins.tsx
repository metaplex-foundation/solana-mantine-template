import { Accordion, Button, Checkbox, CloseButton, Flex, Group, NumberInput, Select, Stack, TagsInput, Text, TextInput } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import { useCreateFormContext } from './CreateFormContext';
import { AuthorityManagedPluginValues } from '@/lib/form';

interface AccordionItemProps {
  id: string
  enabled?: boolean;
  disabled?: boolean;
  label: string;
  description: string;
  children: React.ReactNode;
  onChange?: (value: boolean) => void;
}

function AccordionItem({ id, label, description, children, enabled, disabled, onChange }: AccordionItemProps) {
  return (
    <Accordion.Item value={id} key={label}>
      <Accordion.Control>
        <Group>
          <Checkbox
            checked={enabled}
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
            }}
            onChange={(event) => onChange?.(event.currentTarget.checked)}
          />
          <div>
            <Text>{label}</Text>
            <Text size="sm" c="dimmed" fw={400}>
              {description}
            </Text>
          </div>
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        {children}
      </Accordion.Panel>
    </Accordion.Item>
  );
}

export function ConfigurePlugins({ type }: { type: 'asset' | 'collection' }) {
  const [accordianValue, setAccordianValue] = useState<string | null>(null);
  const form = useCreateFormContext();
  const createAccordianInputHelper = (pluginName: keyof AuthorityManagedPluginValues) => ({
    id: pluginName,
    enabled: form.values[`${type}Plugins`][pluginName].enabled,
    onChange: (value: boolean) => {
      form.setFieldValue(`${type}Plugins.${pluginName}.enabled`, value);
      if (value) {
        setAccordianValue(pluginName);
      }
    },
  });

  const getPrefix = useCallback((pluginName: keyof AuthorityManagedPluginValues) => `${type}Plugins.${pluginName}`, [type]);
  const attributes = form.values[`${type}Plugins`].attributes.data;
  const { creators, ruleSet, enabled: royaltiesEnabled } = form.values[`${type}Plugins`].royalties;

  useEffect(() => {
    if (!royaltiesEnabled) {
      form.clearFieldError(`${getPrefix('royalties')}.creators.percentage`);
    }
    let sum = 0;
    creators.forEach((c) => {
      sum += c.percentage;
    });
    if (sum !== 100) {
      form.setFieldError(`${getPrefix('royalties')}.creators.percentage`, 'Creator percentages must sum to 100');
      return;
    }
    form.clearFieldError(`${getPrefix('royalties')}.creators.percentage`);
  }, [creators, royaltiesEnabled]);

  return (
    <Accordion variant="separated" value={accordianValue} onChange={setAccordianValue}>
      <AccordionItem
        label="Royalties"
        description={`Add royalty enforcement to your ${type}`}
        {...createAccordianInputHelper('royalties')}
      >
        <Stack>
          <NumberInput
            label="Basis points"
            description="500 basis points is 5%"
            maw="30%"
            min={0}
            max={10000}
            defaultValue={500}
            {...form.getInputProps(`${getPrefix('royalties')}.basisPoints`)}
          />
          <div>
            <Stack>
              {creators.map(({ address, percentage }, index) => (
                <Flex align="center">
                  <TextInput
                    value={address}
                    label={index === 0 ? 'Creator address' : undefined}
                    defaultValue=""
                    mr="md"
                    {...form.getInputProps(`${getPrefix('royalties')}.creators.${index}.address`)}
                  />
                  <NumberInput
                    value={percentage}
                    label={index === 0 ? 'Share' : undefined}
                    suffix="%"
                    min={0}
                    max={100}
                    mr="xs"
                    {...form.getInputProps(`${getPrefix('royalties')}.creators.${index}.percentage`)}
                  />
                  {index !== 0 && <CloseButton
                    onClick={() => {
                      form.removeListItem(`${type}Plugins.royalties.creators`, index);
                    }}
                  />}
                </Flex>
              ))}
              {form.errors[`${type}Plugins.royalties.creators.percentage`] && (
                <Text color="red" size="xs">{form.errors[`${type}Plugins.royalties.creators.percentage`]}</Text>
              )}
            </Stack>
            <span>
              <Button
                variant="transparent"
                onClick={() => {
                  form.setFieldValue(`${type}Plugins.royalties.creators`, [
                    ...creators,
                    { address: '', percentage: 0 },
                  ]);
                }}
              >
                + Add creator
              </Button>
            </span>
          </div>
          <Select
            label="Royalty rule set"
            description={`Configure which programs can interact with your ${type}`}
            defaultValue="None"
            data={['None', 'Allow list', 'Deny list']}
            maw="30%"
            value={ruleSet}
            {...form.getInputProps(`${getPrefix('royalties')}.ruleSet`)}
          />
          {ruleSet === 'None' && (
            <Text size="sm">This is the most permissive rule set, also known as the compatability rule set.</Text>
          )}
          {ruleSet === 'Allow list' && (
            <>
              <Text size="sm">This is the most restrictive rule set. Only allow programs on this list to interact with this {type}</Text>
              <TagsInput
                label="Press Enter to add a program address"
                placeholder="Enter program addresses"
                {...form.getInputProps(`${getPrefix('royalties')}.programs`)}
              />
            </>
          )}
          {ruleSet === 'Deny list' && (
            <>
              <Text size="sm">Deny programs on this list to interact with this {type}</Text>
              <TagsInput
                label="Press Enter to add a program address"
                placeholder="Enter program addresses"
                {...form.getInputProps(`${getPrefix('royalties')}.programs`)}
              />
            </>
          )}
        </Stack>
      </AccordionItem>
      <AccordionItem
        label="Attributes"
        description={`Attach custom on-chain data to your ${type}`}
        {...createAccordianInputHelper('attributes')}
      >
        <Stack>
          <Text size="sm">Attaching key-value attributes allows on-chain and indexers programs to interact with your {type}. DAS providers supporting mpl-core will automatically index this data.</Text>

          {attributes.map(({ key, value }, index) => (
            <Group>
              <TextInput
                value={key}
                defaultValue=""
                {...form.getInputProps(`${getPrefix('attributes')}.data.${index}.key`)}
              />
              <TextInput
                value={value}
                {...form.getInputProps(`${getPrefix('attributes')}.data.${index}.value`)}
              />
              <CloseButton
                onClick={() => {
                  const newAttributes = [...attributes];
                  newAttributes.splice(index, 1);
                  form.setFieldValue(`${type}Plugins.attributes.data`, newAttributes);
                }}
              />
            </Group>
          ))}
          <span>
            <Button
              variant="subtle"
              onClick={() => {
                form.setFieldValue(`${type}Plugins.attributes.data`, [
                  ...attributes,
                  { key: '', value: '' },
                ]);
              }}
            >
              + Add attribute
            </Button>
          </span>

        </Stack>
      </AccordionItem>

    </Accordion>
  );
}
