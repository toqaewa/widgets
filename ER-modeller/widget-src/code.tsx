
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
  // Настройки видимости полей
  const [hasDescription, setHasDescription] = useSyncedState("hasDescription", true);
  const [hasLink, setHasLink] = useSyncedState("hasLink", true);

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
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5V19M5 12H19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        `,
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
      {
        itemType: "toggle",
        propertyName: "hasDescription",
        tooltip: "Показывать описание",
        isToggled: hasDescription,
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 17.25V21H6.75L17.81 9.93L14.06 6.18L3 17.25ZM20.71 7.04L16.96 3.29L15.12 5.12L18.87 8.87L20.71 7.04Z" fill="white"/>
        </svg>
        `,
      },
      {
        itemType: "toggle",
        propertyName: "hasLink",
        tooltip: "Показывать ссылку",
        isToggled: hasLink,
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.479 3.53087C19.5519 2.60383 18.2978 2.07799 16.9868 2.0666C15.6758 2.0552 14.4128 2.55918 13.47 3.46997L11.75 5.17997C11.1488 5.78117 10.7727 6.57194 10.6855 7.41299C10.5983 8.25404 10.8052 9.09633 11.27 9.79997M14 11C13.5705 10.4259 13.0226 9.95087 12.3934 9.60705C11.7643 9.26323 11.0685 9.05888 10.3533 9.00766C9.63821 8.95643 8.92041 9.05963 8.24866 9.3102C7.57691 9.56077 6.96689 9.95296 6.46001 10.46L3.46001 13.46C2.54922 14.403 2.04524 15.666 2.05663 16.977C2.06803 18.288 2.59387 19.542 3.52091 20.4691C4.44795 21.3961 5.70202 21.922 7.013 21.9334C8.32398 21.9448 9.58699 21.4408 10.53 20.53L12.24 18.82C12.8412 18.2188 13.2173 17.428 13.3045 16.587C13.3917 15.746 13.1848 14.9036 12.72 14.2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        `,
      },
    ],
    ({ propertyName, propertyValue }) => {
      if (propertyName === "add-attribute") addAttribute();
      if (propertyName === "color" && propertyValue) handleColorChange(propertyValue);
      if (propertyName === "hasDescription") setHasDescription(!hasDescription);
      if (propertyName === "hasLink") setHasLink(!hasLink);
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

      {hasDescription && (
        <Input
          placeholder="Описание"
          value={description}
          onTextEditEnd={(e) => setDescription(e.characters)}
          width="fill-parent"
          inputBehavior="multiline" // Многострочный ввод
        />
      )}

      {hasLink && (
        <Input
          placeholder="URL"
          value={linkURL}
          onTextEditEnd={(e) => setLinkURL(e.characters)}
          width="fill-parent"
        />
      )}

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
