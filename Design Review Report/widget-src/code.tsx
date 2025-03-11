const { widget } = figma
const { AutoLayout, Text, Input, SVG, Image, usePropertyMenu, useSyncedState, useEffect } = widget

// статусы ревью сразу с цветами тега
const STATUSES = [
  { name: "APPROVED", textColor: { r: 0.09, g: 0.5, b: 0.24, a: 1 }, fillColor: { r: 0.29, g: 0.87, b: 0.5, a: 1 } },
  { name: "NEEDS SYNC", textColor: { r: 0.63, g: 0.38, b: 0.03, a: 1 }, fillColor: { r: 0.99, g: 0.88, b: 0.28, a: 1 } },
  { name: "NEEDS DESIGN", textColor: { r: 0.49, g: 0.13, b: 0.81, a: 1 }, fillColor: { r: 0.85, g: 0.71, b: 1, a: 1 } },
  { name: "NOT APPROVED", textColor: { r: 0.73, g: 0.11, b: 0.11, a: 1 }, fillColor: { r: 0.99, g: 0.65, b: 0.65, a: 1 } },
]

// окружения
const ENVS = [
  { name: "preprod" },
  { name: "dev" },
  { name: "stage" },
  { name: "prod" },
  { name: "Storybook" },
]

type Issue = {
  id: string,
  summary: string,
  description: string,
  env: string,
  link: string,
};

function Widget() {

  const [subject, setSubject] = useSyncedState("subject", "");
  const [conductedAt, setConductedAt] = useSyncedState("conductedAt", "");
  const [author, setAuthor] = useSyncedState("author", "");
  const [authorAvatar, setAuthorAvatar] = useSyncedState("authorAvatar", "");
  const [status, setStatus] = useSyncedState("status", STATUSES[0].name);
  const [statusTextColor, setStatusTextColor] = useSyncedState("statusTextColor", STATUSES[0].textColor);
  const [statusFillColor, setStatusFillColor] = useSyncedState("statusFillColor", STATUSES[0].fillColor);
  const [env, setEnv] = useSyncedState("env", ENVS[0].name);

  const [issues, setIssues] = useSyncedState<Issue[]>("issues", []);
  const [editingIssueId, setEditingIssueId] = useSyncedState<string | null>("editingIssueId", null);

  useEffect(() => {
    figma.ui.onmessage = (msg) => {
      if (msg.type === 'showToast') {
        figma.notify('Hello widget')
      }
      if (msg.type === 'close') {
        figma.closePlugin()
      }
    }
  })

  return (
    <Text
      fontSize={24}
      onClick={
        () =>
          new Promise((resolve) => {
            figma.showUI(__html__)
          })
      }
    >
      Open IFrame
    </Text>
  )
}

widget.register(Widget)
