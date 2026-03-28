export const submitCheckin = async (data: {
    userId: string;
    checkpointId: string;
    timestamp: number;
    latitude: number;
    longitude: number;
}) => {
    // Simulate API call
    // Replace this with actual API endpoint
    console.log('[API] Submitting checkin:', data);
    return new Promise((resolve) => setTimeout(resolve, 500));
};
