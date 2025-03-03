/// <reference types="@figma/plugin-typings" />
/// <reference types="@figma/widget-typings" />

const { widget } = figma;
const { AutoLayout, Text, Input, usePropertyMenu, useSyncedState, useEffect } = widget;

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Checklist {
  id: string;
  title: string;
  description?: string;
  items: ChecklistItem[];
}

function Checklist() {
  const [checklist, setCheckList] = useSyncedState<Checklist | null>('checklist', null);
  const checklistData = checklist ?? { title: "", description: "", items: [] };
  const [title, setTitle] = useSyncedState("title", "");
  const [description, setDescription] = useSyncedState("description", "");
  const [showDescription, setShowDescription] = useSyncedState("showDescription", true);
  const [items, setItems] = useSyncedState("items", []);

  const addItem = () => {
    setCheckList(prev => {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        text: '',
        completed: false,
      };
  
      if (!prev) {
        return { id: Date.now().toString(), title, description, items: [newItem] };
      }
  
      return { ...prev, items: [...prev.items, newItem] };
    });
  };

  const updateItem = (id: string, text: string) => {
    if (!checklist) return;
    setCheckList({
      ...checklist,
      items: checklist.items.map(item => (item.id === id ? { ...item, text } : item)),
    });
  };

  const removeItem = (id: string) => {
    if (!checklist) return;
    setCheckList({
      ...checklist,
      items: checklist.items.filter(item => item.id !== id),
    });
  };

  const toggleComplete = (id: string) => {
    if (!checklist) return;
    setCheckList({
      ...checklist,
      items: checklist.items.map(item => (item.id === id ? { ...item, completed: !item.completed } : item)),
    });
  };

  usePropertyMenu(
    [
      { 
        itemType: "action", 
        propertyName: "add", 
        tooltip: "Добавить элемент", 
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5V19M5 12H19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        `, 
      },
      {
        itemType: "toggle",
        propertyName: "toggleDescription",
        tooltip: "Показывать описание",
        isToggled: showDescription,
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 17.25V21H6.75L17.81 9.93L14.06 6.18L3 17.25ZM20.71 7.04L16.96 3.29L15.12 5.12L18.87 8.87L20.71 7.04Z" fill="white"/>
        </svg>
        `,
      },
    ],
    ({ propertyName }) => {
      if (propertyName === "add") addItem();
      if (propertyName === "toggleDescription") setShowDescription(!showDescription);
    }
  );

  return (
    <AutoLayout 
      direction="vertical" 
      minWidth={300}
      spacing={8} 
      padding={16}
      cornerRadius={8}
      fill={[{ type: "solid", color: { r: 0.95, g: 0.95, b: 0.95, a: 1 } }]}
      stroke={[{ type: "solid", color: {r: 0.75, g: 0.75, b: 0.75, a: 1} }]}
      >
      <Input
        value={title}
        placeholder="Название чеклиста"
        width="fill-parent"
        fontSize={24} 
        fontWeight="bold"
        onTextEditEnd={(e) => setTitle(e.characters)}
      />
      {showDescription && (
        <Input
          value={description}
          placeholder="Описание"
          onTextEditEnd={(e) => setDescription(e.characters)}
          inputBehavior="multiline"
          width="fill-parent"
        />
      )}
      {checklistData?.items.map(item => (
        <AutoLayout 
          key={item.id} 
          direction="horizontal" 
          spacing={8} 
          verticalAlignItems="center"
          width={420}
        >
          <AutoLayout
            width={16}
            height={16}
            cornerRadius={4}
            stroke="#777"
            fill="#FFF"
            onClick={() => toggleComplete(item.id)}
            horizontalAlignItems="center"
            verticalAlignItems="center"
          >
            {item.completed && (
              <Text fill="#777" fontSize={10} fontWeight="bold">
                ✓
              </Text>
            )}
          </AutoLayout>
          <Input
            value={item.text}
            placeholder="Элемент чеклиста"
            onTextEditEnd={(e) => updateItem(item.id, e.characters)}
            textDecoration={item.completed ? "strikethrough" : "none"}
            fill={item.completed ? "#777" : "#000"} 
            width="fill-parent"
          />
          <Text onClick={() => removeItem(item.id)}>-</Text>
      </AutoLayout>
      ))}
    </AutoLayout>
  );
}

// Регистрация виджета
widget.register(Checklist);
