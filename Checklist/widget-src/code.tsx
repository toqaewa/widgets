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

const THEMES = [
  {name: "LIGHT", bgColor:"#FCFCFC", primaryTextColor: "#333333", secondaryTextColor: "#777777", progressBarContentColor: "#333333", progressBarColor: "#999999", progressBarBackgroundColor: "#E0E0E0", buttonHoverColor: "#3399FF33", buttonTextHoverColor: "#333333"},
  {name: "DARK", bgColor:"#292929", primaryTextColor: "#EEEEEE", secondaryTextColor: "#777777", progressBarContentColor: "#EEEEEE", progressBarColor: "#393939", progressBarBackgroundColor: "#444444", buttonHoverColor: "#3399FF33", buttonTextHoverColor: "#DDDDDD"}
]

const LIGHT_THEME_ICON = `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" fill="#FFFFFF"/>
    <path d="M11 1H13V4H11V1Z" fill="#FFFFFF"/>
    <path d="M11 20H13V23H11V20Z" fill="#FFFFFF"/>
    <path d="M3.51465 4.9289L4.92886 3.51468L7.05024 5.63606L5.63603 7.05027L3.51465 4.9289Z" fill="#FFFFFF"/>
    <path d="M16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364Z" fill="#FFFFFF"/>
    <path d="M1 11H4V13H1V11Z" fill="#FFFFFF"/>
    <path d="M20 11H23V13H20V11Z" fill="#FFFFFF"/>
    <path d="M5.63603 16.9497L7.05024 18.364L4.92886 20.4853L3.51465 19.0711L5.63603 16.9497Z" fill="#FFFFFF"/>
    <path d="M18.364 7.05027L16.9497 5.63606L19.0711 3.51468L20.4853 4.9289L18.364 7.05027Z" fill="#FFFFFF"/>
  </svg>
`;

const DARK_THEME_ICON = `
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M2.83097 9.69289C2.83097 13.835 6.18884 17.1929 10.3309 17.1929C13.0716 17.1929 15.4714 15.722 16.7799 13.525C13.9405 14.4407 10.5769 13.9623 8.31913 11.7046C6.04346 9.4288 5.60514 6.07009 6.55597 3.24408C4.33926 4.56603 2.83097 6.99107 2.83097 9.69289ZM17.6559 11.3209C18.3439 10.9184 19.3793 11.374 19.1668 12.1421C18.0954 16.0156 14.5454 18.8596 10.3309 18.8596C5.26837 18.8596 1.16431 14.7555 1.16431 9.69289C1.16431 5.49059 4.11289 1.88201 8.01285 0.833291C8.78286 0.626221 9.22053 1.66145 8.80353 2.34109C7.25033 4.8721 7.36007 8.38839 9.49762 10.526C11.61 12.6385 15.1139 12.8085 17.6559 11.3209Z" fill="#FFFFFF"/>
  </svg>
`;

function Checklist() {
  const [checklist, setCheckList] = useSyncedState<Checklist | null>('checklist', null);
  const checklistData = checklist ?? { title: "", description: "", items: [] };
  const [title, setTitle] = useSyncedState("title", "");
  const [description, setDescription] = useSyncedState("description", "");
  const [showDescription, setShowDescription] = useSyncedState("showDescription", true);

  const [showProgressBar, setShowProgressBar] = useSyncedState("showProgressBar", false)

  const [showCompleted, setShowCompleted] = useSyncedState("showCompleted", true)

  const [theme, setTheme] = useSyncedState("theme", THEMES[0].name);
  const [isDarkTheme, setIsDarkTheme] = useSyncedState("isDarkTheme", false);
  const [bgColor, setBgColor] = useSyncedState("bgColor", THEMES[0].bgColor);
  const [primaryTextColor, setPrimaryTextColor] = useSyncedState("primaryTextColor", THEMES[0].primaryTextColor);
  const [secondaryTextColor, setSecondaryTextColor] = useSyncedState("secondaryTextColor", THEMES[0].secondaryTextColor);
  const [progressBarContentColor, setProgressBarContentColor] = useSyncedState("progressBarContentColor", THEMES[0].progressBarContentColor);
  const [progressBarColor, setProgressBarColor] = useSyncedState("progressBarColor", THEMES[0].progressBarColor);
  const [progressBarBackgroundColor, setProgressBarBackgroundColor] = useSyncedState("progressBarBackgroundColor", THEMES[0].progressBarBackgroundColor);
  const [buttonHoverColor, setButtonHoverColor] = useSyncedState("buttonHoverColor", THEMES[0].buttonHoverColor);
  const [buttonTextHoverColor, setButtonTextHoverColor] = useSyncedState("buttonTextHoverColor", THEMES[0].buttonTextHoverColor);


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

  function handleThemeChange(isDark: boolean) {
    const selectedTheme = isDark ? THEMES[1] : THEMES[0]; // [1] - DARK, [0] - LIGHT
    setIsDarkTheme(isDark);
    setTheme(selectedTheme.name);
    setBgColor(selectedTheme.bgColor);
    setPrimaryTextColor(selectedTheme.primaryTextColor);
    setSecondaryTextColor(selectedTheme.secondaryTextColor);
    setProgressBarContentColor(selectedTheme.progressBarContentColor);
    setProgressBarBackgroundColor(selectedTheme.progressBarBackgroundColor);
    setProgressBarColor(selectedTheme.progressBarColor);
    setButtonHoverColor(selectedTheme.buttonHoverColor);
    setButtonTextHoverColor(selectedTheme.buttonTextHoverColor);
  }

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
      hoverStyle={{ fill: buttonHoverColor}}
      onClick={onClick}
      tooltip={tooltip}
    >
      <Text fontSize={12} hoverStyle={{ fill: buttonTextHoverColor}}>
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
      onClick?: () => void;
      completed: number;
      total: number;
      icon?: SVG;
    }
  ) => (
    <AutoLayout
      direction="horizontal"
      width={200}
      height={16}
      cornerRadius={99}
      fill={progressBarBackgroundColor}
      onClick={onClick}
      hoverStyle={{opacity: 0.8}}
    >
      {completed > 0 && (
        <AutoLayout
          width={total > 0 ? (completed / total) * 200 : 0}
          height={"fill-parent"}
          fill={progressBarColor}
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
          <Text fontSize={8} fontWeight={"bold"} fill={progressBarContentColor}>☑️ {completed} of {total} complete</Text>
        ) : (
          <Text fontSize={8} fontWeight={"bold"} fill={progressBarContentColor}>{completed} of {total} complete</Text>
        )}
      </AutoLayout>
    </AutoLayout>
  );

  const EyeOnIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M12 19C18 19 22 13 22 12C22 11 18 5 12 5C6 5 2 11 2 12C2 13 6 19 12 19ZM17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12ZM15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" fill="${progressBarContentColor}"/>
    </svg>
  `;

  const EyeOffIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M3.5 5.5L4.5 4.5L6.64992 6.64992L8.46447 8.46447L9.87868 9.87868L14.1213 14.1213L15.5355 15.5355L17.3501 17.3501L18.5 18.5L17.5 19.5L16.0619 18.0619C14.8511 18.6315 13.487 19 12 19C6 19 2 13 2 12C2 11.4335 3.28348 9.26274 5.48693 7.48693L3.5 5.5ZM7.60814 9.60814C7.22038 10.3186 7 11.1336 7 12C7 14.7614 9.23858 17 12 17C12.8664 17 13.6814 16.7796 14.3919 16.3919L12.8715 14.8715C12.5957 14.9551 12.3031 15 12 15C10.3431 15 9 13.6569 9 12C9 11.6969 9.04495 11.4043 9.12854 11.1285L7.60814 9.60814ZM7.93809 5.93809L9.60814 7.60814C10.3186 7.22038 11.1336 7 12 7C14.7614 7 17 9.23858 17 12C17 12.8664 16.7796 13.6814 16.3919 14.3919L18.5131 16.5131C20.7165 14.7373 22 12.5665 22 12C22 11 18 5 12 5C10.513 5 9.14893 5.36851 7.93809 5.93809ZM11.1285 9.12854L14.8715 12.8715C14.9551 12.5957 15 12.3031 15 12C15 10.3431 13.6569 9 12 9C11.6969 9 11.4043 9.04495 11.1285 9.12854Z" fill="${progressBarContentColor}"/>
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
      {
        itemType: "toggle",
        propertyName: "theme",
        tooltip: "Toggle theme",
        icon: isDarkTheme ? DARK_THEME_ICON : LIGHT_THEME_ICON,
        isToggled: isDarkTheme,
      },
      {
        itemType: "separator",
      },
      {
        itemType: "toggle",
        propertyName: "toggleCompleted",
        tooltip: showCompleted ? "Hide completed" : "Show completed",
        // icon: showCompleted ? EyeOffIcon : EyeOnIcon,
        isToggled: !showCompleted,
      },
    ],
    ({ propertyName }) => {
      if (propertyName === "add") addItem();
      if (propertyName === "toggleDescription") setShowDescription(!showDescription);
      if (propertyName === "toggleProgressBar") setShowProgressBar(!showProgressBar);
      if (propertyName === "theme") handleThemeChange(!isDarkTheme);
      if (propertyName === "toggleCompleted") setShowCompleted(!showCompleted);
    }
  );

  return (
    <AutoLayout 
      direction="vertical" 
      minWidth={300}
      spacing={8} 
      padding={16}
      cornerRadius={20}
      fill={bgColor}
    >
      {showProgressBar && (
        <ProgressBar
          // onClick={() => setShowCompleted(!showCompleted)}
          completed={completedCount}
          total={totalCount}
          // icon={EyeIcon}
        />
      )}
      <Input
        value={title}
        placeholder="Checklist title"
        width="fill-parent"
        fontSize={18} 
        fontWeight="bold"
        onTextEditEnd={(e) => setTitle(e.characters)}
        fill={primaryTextColor}
        hoverStyle={{opacity: 0.7}}
      />
      {showDescription && (
        <Input
          value={description}
          placeholder="Description"
          onTextEditEnd={(e) => setDescription(e.characters)}
          inputBehavior="multiline"
          width="fill-parent"
          fill={secondaryTextColor}
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
                stroke={secondaryTextColor}
                fill={bgColor}
                onClick={() => toggleComplete(item.id)}
                horizontalAlignItems="center"
                verticalAlignItems="center"
                hoverStyle={{opacity: 0.7}}
              >
                {item.completed && (
                  <Text fill={secondaryTextColor} fontSize={10} fontWeight="bold">
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
              fill={item.completed ? secondaryTextColor : primaryTextColor} 
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
