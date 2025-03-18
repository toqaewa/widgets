const { widget } = figma
const { useEffect, usePropertyMenu, useSyncedState, Input, AutoLayout, Text } = widget

const STATUSES = [
  { name: "IN DESIGN", textColor: { r: 0, g: 0, b: 0, a: 1 }, fillColor: { r: 0, g: 0, b: 0, a: 1 } },
  { name: "IN PRODUCTION", textColor: { r: 0, g: 0, b: 0, a: 1 }, fillColor: { r: 0, g: 0, b: 0, a: 1 } },
  { name: "DEPRECATED", textColor: { r: 0, g: 0, b: 0, a: 1 }, fillColor: { r: 0, g: 0, b: 0, a: 1 } },
  { name: "ARCHIVED", textColor: { r: 0, g: 0, b: 0, a: 1 }, fillColor: { r: 0, g: 0, b: 0, a: 1 } },
]

interface Link {
  id: string;
  text: string;
  URL: string;
}

interface UseCase {
  id: string;
  name: string;
  description?: string;
  isWrapped: boolean;
  links: Link[];
}

function Widget() {
  const [componentName, setComponentName] = useSyncedState("componentName", "");

  const [componentLink, setComponentLink] = useSyncedState("componentLink", "");

  const [componentStatus, setComponentStatus] = useSyncedState("status", STATUSES[0].name);
  const [statusTextColor, setStatusTextColor] = useSyncedState("statusTextColor", STATUSES[0].textColor);
  const [statusFillColor, setStatusFillColor] = useSyncedState("statusFillColor", STATUSES[0].fillColor);

  const [useCases, setUseCases] = useSyncedState<UseCase[]>("useCases", []);
  const [editingUseCaseId, setEditingUseCaseId] = useSyncedState<string | null>("editingUseCaseId", null);

  const [errorState, setErrorState] = useSyncedState<Record<string, boolean>>("errorState", {});


  return (
    <Text>Widget rendered</Text>
  )
}

widget.register(Widget)
