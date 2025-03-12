/// <reference types="@figma/plugin-typings" />
/// <reference types="@figma/widget-typings" />

const { widget } = figma;
const { AutoLayout, Text, Input, Frame, useSyncedState, usePropertyMenu, colorMapToOptions } = widget;

type Attribute = {
  id: string;
  name: string;
  type: string;
  description: string;
};

type Link ={
  id: string;
  text: string;
  URL: string;
}

const COLOR_PALETTE = [
  { name: "grey", value: "#F2F2F2" }, // Серый
  { name: "blue", value: "#91C4FA" }, // Синий
  { name: "green", value: "#91DEAB" }, // Зеленый UIColor(red: 0.57, green: 0.87, blue: 0.67, alpha: 1)
  { name: "orange", value: "#FAC491" }, // Оранжевый UIColor(red: 0.98, green: 0.77, blue: 0.57, alpha: 1)
  { name: "red", value: "#FA9191" }, // Красный UIColor(red: 0.98, green: 0.57, blue: 0.57, alpha: 1)
  { name: "purple", value: "#C491FA" }, // Фиолетовый UIColor(red: 0.77, green: 0.57, blue: 0.98, alpha: 1)
  { name: "pink", value: "#FAABDE" }, // Розовый UIColor(red: 0.98, green: 0.67, blue: 0.87, alpha: 1)
  { name: "turquoise", value: "#91DEDE" }, // Бирюзовый UIColor(red: 0.57, green: 0.87, blue: 0.87, alpha: 1)
];

const SIZES = [
  { name: "S", value: 300 },
  { name: "M", value: 500 },
  { name: "L", value: 800 },
];

function ERModeller() {
  // Синхронизированное состояние
  const [entityName, setEntityName] = useSyncedState("entityName", "");
  const [description, setDescription] = useSyncedState("description", "");
  // const [linkURL, setLinkURL] = useSyncedState("linkURL", "");
  const [attributes, setAttributes] = useSyncedState<Attribute[]>("attributes", []);
  const [widgetColor, setWidgetColor] = useSyncedState("widgetColor", COLOR_PALETTE[0].value); // По умолчанию первый цвет из палитры
  // Настройки видимости полей
  const [hasDescription, setHasDescription] = useSyncedState("hasDescription", true);
  // Настройка ширины виджета
  const [width, setWidth] = useSyncedState("width", SIZES[0].value);
  // Добавление ссылок
  const [links, setLinks] = useSyncedState<Link[]>("links", []);
  const [editingLink, setEditingLink] = useSyncedState<string | null>("editingLink", null);

  function addLink() {
    const newLink: Link = {
      id: Date.now().toString(),
      text: "",
      URL: "",
    };
    setLinks([newLink, ...links]);
    setEditingLink(newLink.id);
  }

  function updateLink(id: string, field: keyof Link, value: string) {
    setLinks(links.map(link => link.id === id ? { ...link, [field]: value } : link));
  }

  function removeLink(id: string) {
    setLinks(links.filter(link => link.id !== id))
  }

  function startEditingLink(id: string) {
    setEditingLink(id);
  }

  function saveLink(id: string) {
    setEditingLink(null);
  }


  // Функция для добавления нового атрибута
  const addAttribute = () => {
    const newAttr: Attribute = {
      id: Date.now().toString(),
      name: "",
      type: "",
      description: "",
    };
    setAttributes([...attributes, newAttr]);
    setWidth(800);
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
      padding={4}
      cornerRadius={4}
      fill={[ ]}
      hoverStyle={{ fill: [{ type: "solid", color: { r: 0.2, g: 0.6, b: 1, a: 0.2 } }] }}
      onClick={onClick}
    >
      <Text fontSize={12} fill={"#777"} hoverStyle={{ fill: [{ type: "solid", color: { r: 0.2, g: 0.2, b: 0.2, a: 1 } }] }}>
        {children}
      </Text>
    </AutoLayout>
  );

  // ссылка
  const LinkButton = ({
    onClick,
    children,
  }: {
    onClick: () => void;
    children: string;
  }) => (
    <AutoLayout
      padding={{ top: 2, right: 8, bottom: 2, left: 2 }}
      spacing={4}
      cornerRadius={4}
      hoverStyle={{ fill: [{ type: "solid", color: { r: 0.2, g: 0.6, b: 1, a: 0.2 } }] }}
      onClick={onClick}
    >
      <Text fontSize={14}>🔗</Text>
      <Text 
        fontSize={14} 
        fontWeight="bold" 
        fill={[{ type: "solid", color: { r: 0.2, g: 0.6, b: 1, a: 1 } }]}
      >
        {children}
      </Text>
    </AutoLayout>
  );

  // Функция для открытия ссылки
  const openLink = (url: string) => {
    return new Promise<void>((resolve) => {
      figma.showUI(__html__, { visible: false });
  
      // Отправляем URL во внешний интерфейс
      figma.ui.postMessage({ type: "open-link", url });
  
      // Ожидаем сообщение от интерфейса о том, что ссылка открыта
      figma.ui.onmessage = (message) => {
        if (message.type === "link-opened") {
          resolve(); // Разрешаем Promise после открытия ссылки
        }
      };
    });
  };
  
  // Обработчик выбора размера
  const handleSizeChange = (propertyName: string) => {
  const selectedSize = SIZES.find((size) => size.name === propertyName)?.value;
  if (selectedSize) {
    setWidth(selectedSize);
  }
};

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
        itemType: "action",
        propertyName: "add-link",
        tooltip: "Добавить ссылку",
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.479 3.53087C19.5519 2.60383 18.2978 2.07799 16.9868 2.0666C15.6758 2.0552 14.4128 2.55918 13.47 3.46997L11.75 5.17997C11.1488 5.78117 10.7727 6.57194 10.6855 7.41299C10.5983 8.25404 10.8052 9.09633 11.27 9.79997M14 11C13.5705 10.4259 13.0226 9.95087 12.3934 9.60705C11.7643 9.26323 11.0685 9.05888 10.3533 9.00766C9.63821 8.95643 8.92041 9.05963 8.24866 9.3102C7.57691 9.56077 6.96689 9.95296 6.46001 10.46L3.46001 13.46C2.54922 14.403 2.04524 15.666 2.05663 16.977C2.06803 18.288 2.59387 19.542 3.52091 20.4691C4.44795 21.3961 5.70202 21.922 7.013 21.9334C8.32398 21.9448 9.58699 21.4408 10.53 20.53L12.24 18.82C12.8412 18.2188 13.2173 17.428 13.3045 16.587C13.3917 15.746 13.1848 14.9036 12.72 14.2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        `,
      },
      {
        itemType: "color-selector",
        propertyName: "color",
        tooltip: "Цвет виджета",
        options: COLOR_PALETTE.map((color) => ({
          option: color.value, // Уникальное значение для выбора
          tooltip: color.name,  // Отображаемое имя в меню
        })),
        selectedOption: widgetColor, // Выбранный цвет по умолчанию
      },
      {
        itemType: "dropdown",
        propertyName: "width",
        tooltip: "Размер виджета",
        options: SIZES.map((size) => ({
          option: size.name,
          label: size.name,
        })),
        selectedOption: SIZES.find((size) => 
          size.value === width
        )?.name || SIZES[0].name,
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
    ],
    ({ propertyName, propertyValue }) => {
      if (propertyName === "add-attribute") addAttribute();
      if (propertyName === "add-link") addLink();
      if (propertyName === "color" && propertyValue) { setWidgetColor(propertyValue) }
      if (propertyName === "hasDescription") setHasDescription(!hasDescription);
      if (propertyName === "width" && propertyValue) handleSizeChange(propertyValue);
    }
  );

  return (
    <AutoLayout
      direction="vertical"
      padding={{ top: 16, right: 16, bottom: 16, left: 16 }}
      spacing={12}
      fill={[{ type: "solid", color: widgetColor }]} // Применяем выбранный цвет
      cornerRadius={16}
      width={width}
      minWidth={300}
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

      {links.map((link) => (
        <AutoLayout
          key={link.id}
          direction="vertical"
          spacing={8}
          width={"fill-parent"}
        >
          {editingLink === link.id ? (
            <>
              <AutoLayout
                direction="horizontal"
                verticalAlignItems="center"
                spacing={8}
                width={"fill-parent"}
              >
                <AutoLayout
                  direction="horizontal"
                  verticalAlignItems="center"
                  spacing={4}
                  fill={[{ type: "solid", color: { r: 1, g: 1, b: 1, a: 0.6 } }]}
                  width={"fill-parent"}
                  cornerRadius={8}
                  padding={4}
                >
                  <Text>📝</Text>
                  <Input
                    value={link.text} 
                    placeholder="Текст ссылки"
                    onTextEditEnd={(e) => updateLink(link.id, "text", e.characters)}
                    width={"fill-parent"}
                  />
                </AutoLayout>
                <AutoLayout
                  direction="horizontal"
                  verticalAlignItems="center"
                  spacing={4}
                  fill={[{ type: "solid", color: { r: 1, g: 1, b: 1, a: 0.6 } }]}
                  width={"fill-parent"}
                  cornerRadius={8}
                  padding={4}
                >
                  <Text>🔗</Text>
                  <Input
                    value={link.URL} 
                    placeholder="Ссылка"
                    onTextEditEnd={(e) => updateLink(link.id, "URL", e.characters)}
                    width={"fill-parent"}
                  />
                </AutoLayout>
                <IconButton onClick={() => saveLink(link.id)}>💾</IconButton>
                <IconButton onClick={() => removeLink(link.id)}>🗑️</IconButton>
              </AutoLayout>
            </>
          ) : (
            <>
              <AutoLayout
                direction="horizontal"
                verticalAlignItems="center"
                spacing={4}
                width={"fill-parent"}
              >
                <LinkButton onClick={() => openLink(link.URL)}>{link.text}</LinkButton>
                <IconButton onClick={() => startEditingLink(link.id)}>✍︎</IconButton>
                <IconButton onClick={() => removeLink(link.id)}>🗑️</IconButton>
              </AutoLayout>
            </>
          )}
        </AutoLayout>
      ))}

      {(width === 300 || width === 500) && attributes.length > 0 && (
        <AutoLayout
          padding={4}
          cornerRadius={4}
          onClick={() => setWidth(800)}
          hoverStyle={{
            fill: [{ type: "solid", color: { r: 0.2, g: 0.6, b: 1, a: 0.2 } }]
          }}
        >
          <Text fontSize={12}>Показать атрибуты</Text>
        </AutoLayout>
      )}

      { !(width === 300 || width === 500) && attributes.map((attr) => (
        <AutoLayout
          key={attr.id}
          direction="horizontal"
          padding={8}
          spacing={4}
          fill={[{ type: "solid", color: { r: 1, g: 1, b: 1, a: 0.4 } }]}
          cornerRadius={8}
          width={"fill-parent"}
          verticalAlignItems="center"
        >
          <Input
            placeholder="Название"
            value={attr.name}
            onTextEditEnd={(e) => updateAttribute(attr.id, "name", e.characters)}
            width={240}
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
            width="fill-parent"
          />
          <IconButton onClick={() => moveAttributeUp(attr.id)}>⤴️</IconButton>
          <IconButton onClick={() => moveAttributeDown(attr.id)}>⤵️</IconButton>
          <IconButton onClick={() => removeAttribute(attr.id)}>🗑️</IconButton>
        </AutoLayout>
      ))}
    </AutoLayout>
  );
}

widget.register(ERModeller);
