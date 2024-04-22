import {
  Title,
  Text,
  Card,
  SimpleGrid,
  Container,
  rem,
  useMantineTheme,
} from '@mantine/core';
import { IconGauge, IconCoin, IconBolt } from '@tabler/icons-react';
import classes from './FeaturesCards.module.css';

const data = [
  {
    title: 'Feature #1',
    description:
      'A really cool feature that you should be excited about. It does some really cool stuff that you will love.',
    icon: IconCoin,
  },
  {
    title: 'Feature #2',
    description:
      "Another really cool feature. It's probably AI related or something. You know, the future and all that.",
    icon: IconGauge,
  },
  {
    title: 'Feature #3',
    description:
      "The final feature. It's the best one yet. You'll be blown away by how amazing it is.",
    icon: IconBolt,
  },
];

export function FeaturesCards() {
  const theme = useMantineTheme();
  const features = data.map((feature) => (
    <Card key={feature.title} shadow="md" radius="md" className={classes.card} padding="xl">
      <feature.icon
        style={{ width: rem(50), height: rem(50) }}
        stroke={2}
        color={theme.colors.mplxGreen[6]}
      />
      <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
        {feature.title}
      </Text>
      <Text fz="sm" c="dimmed" mt="sm">
        {feature.description}
      </Text>
    </Card>
  ));

  return (
    <Container size="lg" className={classes.wrapper}>
      {/* <Group justify="center">
        <Badge variant="filled" size="lg">
          Best company ever
        </Badge>
      </Group> */}

      <Title order={2} className={classes.title} ta="center" mt="sm">
        A blurb describing your product
      </Title>

      <Text c="dimmed" className={classes.description} ta="center" mt="md">
        A really cool description explaining why your product is the best thing since sliced bread. It's so good, you'll never want to use anything else. Make sure to include some buzzwords like "revolutionary" and "disruptive" to really drive the point home.
      </Text>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt={50}>
        {features}
      </SimpleGrid>
    </Container>
  );
}
