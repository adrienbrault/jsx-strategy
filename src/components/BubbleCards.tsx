import { AreaConfig } from "../area";
import { elementToConfig } from "../jsx";

import * as R from "remeda";

export const BubbleCards = ({
  areaConfigs,
}: {
  areaConfigs: Array<AreaConfig>;
}) => {
  return [
    ...areaConfigs.map((areaConfig) => <BubbleAreaCard {...areaConfig} />),
    <BubbleHorizontalButtons areaConfigs={areaConfigs} />,
  ];
};

const groupCards = (cards: Array<any>, groupSize: number) => {
  return R.chunk(cards, groupSize).map((group) => (
    <horizontal-stack>{...group}</horizontal-stack>
  ));
};

const BubbleAreaCard = ({
  area,
  icon,
  entityIdsByDomain,
  mainEntities,
  states,
}: AreaConfig) => {
  const lightCards = entityIdsByDomain["light"].map((entityId) => {
    return (
      <custom-bubble-card
        card_type="button"
        entity={entityId}
        button_type="switch"
        show_state={true}
      />
    );
  });
  const coverCards = entityIdsByDomain["cover"].map((entityId) => (
    <custom-bubble-card card_type="cover" entity={entityId} />
  ));
  const climateCards = entityIdsByDomain["climate"].map((entityId) => (
    <custom-mushroom-climate-card
      entity={entityId}
      collapsible_controls={false}
      fill_container={false}
      hvac_modes={["heat", "cool"]}
      show_temperature_control={true}
      hold_action={{ action: "more-info" }}
      double_tap_action={{ action: "more-info" }}
      card_mod={{
        style: "ha-card {\n  border: none;\n  padding: 0 !important;\n}\n",
      }}
    />
  ));
  const cameraCards = entityIdsByDomain["camera"].map((entityId) => {
    return <picture-entity entity={entityId} />;
  });
  const mediaPlayerCards = entityIdsByDomain["media_player"].map((entityId) => (
    <custom-bubble-card
      card_type="button"
      entity={entityId}
      button_type="switch"
      show_state={true}
    />
  ));

  const binarySensorCards = entityIdsByDomain["binary_sensor"].map(
    (entityId) => (
      <custom-bubble-card
        card_type="button"
        entity={entityId}
        button_type="custom"
        show_state={true}
      />
    )
  );
  const sensorCards = Object.values(
    R.groupBy(
      entityIdsByDomain["sensor"],
      (entityId) => states[entityId].attributes.device_class
    )
  ).map((entityIds) => <custom-mini-graph-card entities={entityIds} />);

  const prependTitleCard = (cards: Array<any>, titleCard: any) => {
    if (cards.length < 1) {
      return [];
    }

    return [titleCard, ...cards];
  };

  const cards = [
    ...prependTitleCard(
      groupCards(lightCards, 2),
      <custom-bubble-card
        card_type="separator"
        name="Lights"
        icon="mdi:lightbulb"
      />
    ),
    ...prependTitleCard(
      groupCards(coverCards, 2),
      <custom-bubble-card
        card_type="separator"
        name="Covers"
        icon="mdi:cover"
      />
    ),
    ...prependTitleCard(
      climateCards,
      <custom-bubble-card
        card_type="separator"
        name="Climate"
        icon="mdi:thermostat"
      />
    ),
    ...prependTitleCard(
      groupCards(mediaPlayerCards, 2),
      <custom-bubble-card
        card_type="separator"
        name="Media Players"
        icon="mdi:multimedia"
      />
    ),
    ...prependTitleCard(
      cameraCards,
      <custom-bubble-card
        card_type="separator"
        name="Cameras"
        icon="mdi:camera"
      />
    ),
    ...prependTitleCard(
      [...binarySensorCards, ...sensorCards],
      <custom-bubble-card card_type="separator" name="Sensors" />
    ),
  ];

  return (
    <vertical-stack>
      <custom-bubble-card
        card_type="pop-up"
        hash={`#${area.area_id}`}
        name={area.name}
        icon={icon}
        entity={mainEntities.light}
        state={mainEntities.temperature}
        auto_close="15000"
      />

      {...cards}
    </vertical-stack>
  );
};

const BubbleHorizontalButtons = ({
  areaConfigs,
}: {
  areaConfigs: Array<AreaConfig>;
}) => {
  let bubbleHorizontalButtonsStackConfig: { [key: string]: string } =
    areaConfigs
      .map(({ area, icon, mainEntities }) => {
        let buttonConfig: Record<string, string> = {
          link: `#${area.area_id}`,
          name: area.name,
        };

        if (mainEntities.light) {
          buttonConfig["entity"] = mainEntities.light;
        }
        if (icon) {
          buttonConfig["icon"] = icon;
        }
        if (mainEntities.motion) {
          buttonConfig[`pir_sensor`] = mainEntities.motion;
        }

        return buttonConfig;
      })
      .map((buttonConfig, index) =>
        R.mapKeys(buttonConfig, (key) => `_${index + 1}_${key}`)
      )
      .reduce((acc, buttonConfig) => {
        return {
          ...acc,
          ...buttonConfig,
        };
      }, {});

  return (
    <vertical-stack>
      <custom-bubble-card
        card_type="horizontal-buttons-stack"
        auto_order={true}
        width_desktop="100%"
        {...bubbleHorizontalButtonsStackConfig}
      />
    </vertical-stack>
  );
};
