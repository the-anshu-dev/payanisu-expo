export const sendNotificaton = async (body) => {
  try {
    const dbResponse = await fetch(
      `${process.env.EXPO_PUBLIC_BASE_URL}/api/notification/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const notificationResponse = await fetch(
      `https://app.nativenotify.com/api/notification`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appId: process.env.EXPO_PUBLIC_NN_APP_ID,
          appToken: process.env.EXPO_PUBLIC_NN_APP_TOKEN,
          title: body.title,
          body: body.content,
          dateSent: new Date().toISOString(),
        }),
      }
    );

    return { dbResponse, notificationResponse };
    
  } catch (error) {
    return { error };
  }
};
