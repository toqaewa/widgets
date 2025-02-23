
// Тестовый виджет, если что-то идет не так и подозреваю что проблема на стороне апихи / пакетов - консолить этот виджет на предмет undefined
// function Widget() {
//   return <Frame width={100} height={100} fill={'#C4C4C4'}></Frame>
// }

// widget.register(Widget)


/// <reference types="@figma/plugin-typings" />
/// <reference types="@figma/widget-typings" />

const { widget } = figma;
const { AutoLayout, Text, Input, Frame, useSyncedState } = widget;

type Attribute = {
  id: string;
  name: string;
  type: string;
  description: string;
};

function ERModeller() {
  // Синхронизированное состояние
  const [entityName, setEntityName] = useSyncedState("entityName", "");
  const [description, setDescription] = useSyncedState("description", "");
  const [linkURL, setLinkURL] = useSyncedState("linkURL", "");
  const [attributes, setAttributes] = useSyncedState<Attribute[]>("attributes", []);

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

  return (
    <AutoLayout
      direction="vertical"
      padding={{ top: 16, right: 16, bottom: 16, left: 16 }}
      spacing={12}
      fill={[{ type: "solid", color: { r: 0.95, g: 0.95, b: 0.95, a: 1 } }]}
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
        placeholder="Описание (Markdown)"
        value={description}
        onTextEditEnd={(e) => setDescription(e.characters)}
        width="fill-parent"
      />
      <Input
        placeholder="URL"
        value={linkURL}
        onTextEditEnd={(e) => setLinkURL(e.characters)}
        width="fill-parent"
      />

      <Button onClick={addAttribute}>Добавить атрибут</Button>
      {attributes.map((attr) => (
        <AutoLayout
          key={attr.id}
          direction="horizontal"
          padding={8}
          spacing={4}
          fill={[{ type: "solid", color: { r: 1, g: 1, b: 1, a: 1 } }]}
          stroke="#ccc"
          cornerRadius={4}
        >
          <Input
            placeholder="Название атрибута"
            value={attr.name}
            onTextEditEnd={(e) => updateAttribute(attr.id, "name", e.characters)}
            width={280}
          />
          <Input
            placeholder="Тип атрибута"
            value={attr.type}
            onTextEditEnd={(e) => updateAttribute(attr.id, "type", e.characters)}
            width={280}
          />
          <Input
            placeholder="Описание атрибута"
            value={attr.description}
            onTextEditEnd={(e) => updateAttribute(attr.id, "description", e.characters)}
            width={280}
          />
          <IconButton onClick={() => removeAttribute(attr.id)}>🗑️</IconButton>
        </AutoLayout>
      ))}
      <AutoLayout width={300}><Text>Пока тут будет этот костыль</Text></AutoLayout>
    </AutoLayout>
  );
}

widget.register(ERModeller);
