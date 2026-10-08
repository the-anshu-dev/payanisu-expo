import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useGetLatestCheckPoint = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLatestCheckPoint = async () => {
            setLoading(true);
            try {
                const storedUser = await AsyncStorage.getItem('user');
                if (!storedUser) {
                    throw new Error('User data not found in storage');
                }
                const parsedUser = JSON.parse(storedUser);
                const email = parsedUser?.email;

                const storedTours = await AsyncStorage.getItem('bookedTours');
                if (!storedTours) {
                    throw new Error('Booked tours not found in storage');
                }
                const parsedTours = JSON.parse(storedTours);
                const tourId = parsedTours[0]?.tourId;
                if (!tourId) {
                    throw new Error('Tour ID not found');
                }

                const response = await fetch(
                    `${process.env.EXPO_PUBLIC_BASE_URL}/api/get-latestUnchecked?tourId=${tourId}&email=${encodeURIComponent(email)}`
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch checkpoint data');
                }
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestCheckPoint();
    }, []);

    return { data, loading, error };
};

export default useGetLatestCheckPoint;