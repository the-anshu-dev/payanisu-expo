export const notificationTypes = [
  {
    id: 3,
    title: "All",
    value: "all",
  },
  {
    id: 2,
    title: "Unread",
    value: "unread",
  },
  {
    id: 1,
    title: "Read",
    value: "read",
  },
];

export const expenseCategories = [
  {
    id: 1,
    label: "Food",
    value: "Food",
  },
  {
    id: 2,
    label: "Transport",
    value: "Transport",
  },
  {
    id: 3,
    label: "Accommodation",
    value: "Accommodation",
  },
  {
    id: 4,
    label: "Stationery",
    value: "stationery",
  },
  {
    id: 5,
    label: "Trekking Kit",
    value: "Trekking Kit",
  },
  {
    id: 6,
    label: "Gift",
    value: "Gift",
  },
  {
    id: 5,
    label: "Miscellaneous",
    value: "Miscellaneous",
  },
];

export const INITIAL_REGION = {
  latitude: 12.9716,
  longitude: 77.5946,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
