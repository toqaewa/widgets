/// <reference types="@figma/plugin-typings" />
/// <reference types="@figma/widget-typings" />

const { widget } = figma;
const { AutoLayout, Text, Input, SVG, usePropertyMenu, useSyncedState, useEffect } = widget;

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

  const [showProgressBar, setShowProgressBar] = useSyncedState("showProgressBar", false)

  const [showCompleted, setShowCompleted] = useSyncedState("showCompleted", true)

  const completedCount = checklistData.items.filter(item => item.completed).length;
  const totalCount = checklistData.items.length;

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

  const IconButton = ({
    onClick,
    children,
    tooltip,
  }: {
    onClick: () => void;
    children: string;
    tooltip?: string;
  }) => (
    <AutoLayout
      padding={4}
      cornerRadius={4}
      fill={[ ]}
      hoverStyle={{ fill: "#E5E7EB"}}
      onClick={onClick}
      tooltip={tooltip}
    >
      <Text fontSize={12}>
        {children}
      </Text>
    </AutoLayout>
  );

  const ProgressBar = (
    {
      onClick,
      completed,
      total,
      icon,
    }: {
      onClick: () => void;
      completed: number;
      total: number;
      icon: SVG;
    }
  ) => (
    <AutoLayout
      direction="horizontal"
      width={200}
      height={16}
      cornerRadius={99}
      fill={"#E0E0E0"}
      onClick={onClick}
      hoverStyle={{opacity: 0.8}}
    >
      {completed > 0 && (
        <AutoLayout
          width={total > 0 ? (completed / total) * 200 : 0}
          height={"fill-parent"}
          fill={"#999"}
        />
      )}
      <AutoLayout
        direction="horizontal"
        positioning="absolute"
        verticalAlignItems="center"
        height={16}
        padding={{vertical: 2, horizontal: 6}}
        spacing={2}
      >
        {icon}
        {completed === total && completed > 0 ? (
          <Text fontSize={8} fontWeight={"bold"} fill={"#333"}>☑️ {completed} of {total} complete</Text>
        ) : (
          <Text fontSize={8} fontWeight={"bold"} fill={"#333"}>{completed} of {total} complete</Text>
        )}
      </AutoLayout>
    </AutoLayout>
  );

  const EyeOnIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M12 19C18 19 22 13 22 12C22 11 18 5 12 5C6 5 2 11 2 12C2 13 6 19 12 19ZM17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12ZM15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" fill="#333"/>
    </svg>
  `;

  const EyeOffIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M3.5 5.5L4.5 4.5L6.64992 6.64992L8.46447 8.46447L9.87868 9.87868L14.1213 14.1213L15.5355 15.5355L17.3501 17.3501L18.5 18.5L17.5 19.5L16.0619 18.0619C14.8511 18.6315 13.487 19 12 19C6 19 2 13 2 12C2 11.4335 3.28348 9.26274 5.48693 7.48693L3.5 5.5ZM7.60814 9.60814C7.22038 10.3186 7 11.1336 7 12C7 14.7614 9.23858 17 12 17C12.8664 17 13.6814 16.7796 14.3919 16.3919L12.8715 14.8715C12.5957 14.9551 12.3031 15 12 15C10.3431 15 9 13.6569 9 12C9 11.6969 9.04495 11.4043 9.12854 11.1285L7.60814 9.60814ZM7.93809 5.93809L9.60814 7.60814C10.3186 7.22038 11.1336 7 12 7C14.7614 7 17 9.23858 17 12C17 12.8664 16.7796 13.6814 16.3919 14.3919L18.5131 16.5131C20.7165 14.7373 22 12.5665 22 12C22 11 18 5 12 5C10.513 5 9.14893 5.36851 7.93809 5.93809ZM11.1285 9.12854L14.8715 12.8715C14.9551 12.5957 15 12.3031 15 12C15 10.3431 13.6569 9 12 9C11.6969 9 11.4043 9.04495 11.1285 9.12854Z" fill="#333"/>
    </svg>
  `;

  const EyeIcon = (
    <SVG
      src = {showCompleted ? EyeOffIcon : EyeOnIcon}
      width={12}
      height={12}
    />
  )

  usePropertyMenu(
    [
      { 
        itemType: "action", 
        propertyName: "add", 
        tooltip: "Add element", 
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5V19M5 12H19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        `, 
      },
      {
        itemType: "toggle",
        propertyName: "toggleDescription",
        tooltip: "Show description",
        isToggled: showDescription,
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 17.25V21H6.75L17.81 9.93L14.06 6.18L3 17.25ZM20.71 7.04L16.96 3.29L15.12 5.12L18.87 8.87L20.71 7.04Z" fill="white"/>
        </svg>
        `,
      },
      {
        itemType: "toggle",
        propertyName: "toggleProgressBar",
        tooltip: "Show progress bar",
        isToggled: showProgressBar,
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2V6M12 18V22M18 2H6V6L12 12L6 18V22H18V18L12 12L18 6V2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        `,
      },
    ],
    ({ propertyName }) => {
      if (propertyName === "add") addItem();
      if (propertyName === "toggleDescription") setShowDescription(!showDescription);
      if (propertyName === "toggleProgressBar") setShowProgressBar(!showProgressBar);
    }
  );

  return (
    <AutoLayout 
      direction="vertical" 
      minWidth={300}
      spacing={8} 
      padding={16}
      cornerRadius={20}
      fill={"#FCFCFC"}
    >
      {showProgressBar && (
        <ProgressBar
          onClick={() => setShowCompleted(!showCompleted)}
          completed={completedCount}
          total={totalCount}
          icon={EyeIcon}
        />
      )}
      <Input
        value={title}
        placeholder="Checklist title"
        width="fill-parent"
        fontSize={18} 
        fontWeight="bold"
        onTextEditEnd={(e) => setTitle(e.characters)}
        fill={"#333"}
        hoverStyle={{opacity: 0.7}}
      />
      {showDescription && (
        <Input
          value={description}
          placeholder="Description"
          onTextEditEnd={(e) => setDescription(e.characters)}
          inputBehavior="multiline"
          width="fill-parent"
          fill={"#777"}
          fontSize={12}
          hoverStyle={{opacity: 0.7}}
        />
      )}
      {checklistData?.items.map(item => (
        (showCompleted || !item.completed) &&
          <AutoLayout 
            key={item.id} 
            direction="horizontal" 
            spacing={4} 
            verticalAlignItems={"start"}
            width={420}
          >
            <AutoLayout
              width={"hug-contents"}
              height={"hug-contents"}
              padding={2}
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
                hoverStyle={{opacity: 0.7}}
              >
                {item.completed && (
                  <Text fill="#777" fontSize={10} fontWeight="bold">
                    ✓
                  </Text>
                )}
              </AutoLayout>
            </AutoLayout>
            <Input
              value={item.text}
              placeholder="Checklist element"
              onTextEditEnd={(e) => updateItem(item.id, e.characters)}
              textDecoration={item.completed ? "strikethrough" : "none"}
              fill={item.completed ? "#777" : "#333"} 
              width="fill-parent"
              fontSize={14}
              lineHeight={20}
              hoverStyle={{opacity: 0.7}}
            />
            <IconButton onClick={() => removeItem(item.id)}>🗑️</IconButton>
        </AutoLayout>
      ))}
    </AutoLayout>
  );
}

// Регистрация виджета
widget.register(Checklist);
