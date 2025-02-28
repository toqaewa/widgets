
// Тестовый виджет, если что-то идет не так и подозреваю что проблема на стороне апихи / пакетов - консолить этот виджет на предмет undefined
// function Widget() {
//   return <Frame width={100} height={100} fill={'#C4C4C4'}></Frame>
// }

// widget.register(Widget)


/// <reference types="@figma/plugin-typings" />
/// <reference types="@figma/widget-typings" />

const { widget } = figma;
const { AutoLayout, Text, Input, Frame, useSyncedState, usePropertyMenu } = widget;

type Attribute = {
  id: string;
  name: string;
  type: string;
  description: string;
};

const COLOR_PALETTE = [
  { name: "grey", value: { r: 0.95, g: 0.95, b: 0.95, a: 1 } }, // Серый
  { name: "blue", value: { r: 0.2, g: 0.6, b: 1, a: 1 } }, // Синий
  { name: "green", value: { r: 0.2, g: 0.8, b: 0.4, a: 1 } }, // Зеленый
  { name: "orange", value: { r: 1, g: 0.6, b: 0.2, a: 1 } }, // Оранжевый
  { name: "red", value: { r: 1, g: 0.2, b: 0.2, a: 1 } }, // Красный
  { name: "purple", value: { r: 0.6, g: 0.2, b: 1, a: 1 } }, // Фиолетовый
  { name: "pink", value: { r: 1, g: 0.4, b: 0.8, a: 1 } }, // Розовый
  { name: "turquoise", value: { r: 0.2, g: 0.8, b: 0.8, a: 1 } }, // Бирюзовый
];

function ERModeller() {
  // Синхронизированное состояние
  const [entityName, setEntityName] = useSyncedState("entityName", "");
  const [description, setDescription] = useSyncedState("description", "");
  const [linkURL, setLinkURL] = useSyncedState("linkURL", "");
  const [attributes, setAttributes] = useSyncedState<Attribute[]>("attributes", []);
  const [widgetColor, setWidgetColor] = useSyncedState("widgetColor", COLOR_PALETTE[0].value); // По умолчанию первый цвет из палитры

  // Функция для добавления нового атрибута
  const addAttribute = () => {
    const newAttr: Attribute = {
      id: Date.now().toString(),
      name: "",
      type: "",
      description: "",
    };
    setAttributes([...attributes, newAttr]);
  };

  // Обновление атрибута
  const updateAttribute = (id: string, field: keyof Attribute, value: string) => {
    const updated = attributes.map((attr) => (attr.id === id ? { ...attr, [field]: value } : attr));
    setAttributes(updated);
  };

  // Удаление атрибута
  const removeAttribute = (id: string) => {
    const updated = attributes.filter((attr) => attr.id !== id);
    setAttributes(updated);
  };

  // Перемещение атрибута вверх
  const moveAttributeUp = (id: string) => {
    const index = attributes.findIndex((attr) => attr.id === id);
    if (index > 0) {
      const updated = [...attributes];
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]]; // Меняем местами
      setAttributes(updated);
    }
  };

  // Перемещение атрибута вниз
  const moveAttributeDown = (id: string) => {
    const index = attributes.findIndex((attr) => attr.id === id);
    if (index < attributes.length - 1) {
      const updated = [...attributes];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]; // Меняем местами
      setAttributes(updated);
    }
  };

  // "Кнопка" как AutoLayout с onClick
  const Button = ({
    onClick,
    children,
  }: {
    onClick: () => void;
    children: string;
  }) => (
    <AutoLayout
      padding={8}
      cornerRadius={4}
      fill={[{ type: "solid", color: { r: 0.2, g: 0.6, b: 1, a: 1 } }]}
      onClick={onClick}
      hoverStyle={{ fill: [{ type: "solid", color: { r: 0.15, g: 0.55, b: 0.9, a: 1 } }] }}
    >
      <Text fontSize={14} fontWeight="bold" fill={[{ type: "solid", color: { r: 1, g: 1, b: 1, a: 1 } }]}>
        {children}
      </Text>
    </AutoLayout>
  );

  // кнопка-иконка чтобы удалять
  const IconButton = ({
    onClick,
    children,
  }: {
    onClick: () => void;
    children: string;
  }) => (
    <AutoLayout
      fill={[ ]}
      onClick={onClick}
    >
      <Text>
        {children}
      </Text>
    </AutoLayout>
  );

  // Обработчик выбора цвета
  const handleColorChange = (propertyName: string) => {
    const selectedColor = COLOR_PALETTE.find((color) => color.name === propertyName)?.value;
    if (selectedColor) {
      setWidgetColor(selectedColor);
    }
  };

  // работа с менюшкой виджета - пока сюда только переехала кнопка Добавить атрибут
  usePropertyMenu(
    [
      {
        itemType: "action",
        propertyName: "add-attribute",
        tooltip: "Добавить атрибут",
      },
      {
        itemType: "dropdown",
        propertyName: "color",
        tooltip: "Цвет виджета",
        options: COLOR_PALETTE.map((color) => ({
          option: color.name, // Уникальное значение для выбора
          label: color.name,  // Отображаемое имя в меню
        })),
        selectedOption: COLOR_PALETTE.find((color) => 
          color.value.r === widgetColor.r &&
          color.value.g === widgetColor.g &&
          color.value.b === widgetColor.b
        )?.name || COLOR_PALETTE[0].name, // Выбранный цвет по умолчанию
      },
    ],
    ({ propertyName, propertyValue }) => {
      if (propertyName === "add-attribute") addAttribute();
      if (propertyName === "color" && propertyValue) handleColorChange(propertyValue);
    }
  );

  return (
    <AutoLayout
      direction="vertical"
      padding={{ top: 16, right: 16, bottom: 16, left: 16 }}
      spacing={12}
      fill={[{ type: "solid", color: widgetColor }]} // Применяем выбранный цвет
      cornerRadius={16}
    >

      <Input
        placeholder="Название сущности"
        value={entityName}
        onTextEditEnd={(e) => setEntityName(e.characters)}
        width="fill-parent"
        fontSize={24} 
        fontWeight="bold" 
        fill={[{ type: "solid", color: { r: 0.1, g: 0.1, b: 0.1, a: 1 } }]}
      />
      <Input
        placeholder="Описание"
        value={description}
        onTextEditEnd={(e) => setDescription(e.characters)}
        width="fill-parent"
        inputBehavior="multiline"
      />
      <Input
        placeholder="URL"
        value={linkURL}
        onTextEditEnd={(e) => setLinkURL(e.characters)}
        width="fill-parent"
      />

      {attributes.map((attr) => (
        <AutoLayout
          key={attr.id}
          direction="horizontal"
          padding={16}
          spacing={4}
          fill={[{ type: "solid", color: { r: 1, g: 1, b: 1, a: 0.4 } }]}
          cornerRadius={8}
        >
          <Input
            placeholder="Название"
            value={attr.name}
            onTextEditEnd={(e) => updateAttribute(attr.id, "name", e.characters)}
            width={200}
          />
          <Input
            placeholder="Тип"
            value={attr.type}
            onTextEditEnd={(e) => updateAttribute(attr.id, "type", e.characters)}
            width={120}
          />
          <Input
            placeholder="Описание"
            value={attr.description}
            onTextEditEnd={(e) => updateAttribute(attr.id, "description", e.characters)}
            width={300}
          />
          <IconButton onClick={() => moveAttributeUp(attr.id)}>⬆️</IconButton>
          <IconButton onClick={() => moveAttributeDown(attr.id)}>⬇️</IconButton>
          <IconButton onClick={() => removeAttribute(attr.id)}>❌</IconButton>
        </AutoLayout>
      ))}
      <AutoLayout width={300}><Text fontSize={1}> </Text></AutoLayout>
    </AutoLayout>
  );
}

widget.register(ERModeller);
