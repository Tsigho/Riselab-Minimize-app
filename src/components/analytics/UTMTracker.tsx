import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const UTMTracker = () => {
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'src'];

        let hasUTM = false;
        const trackingData: Record<string, string> = {};

        utmKeys.forEach(key => {
            const value = params.get(key);
            if (value) {
                // Map 'src' to 'utm_source' if 'utm_source' is missing, common in affiliate links
                if (key === 'src' && !trackingData['utm_source']) {
                    trackingData['utm_source'] = value;
                } else {
                    trackingData[key] = value;
                }
                hasUTM = true;
            }
        });

        if (hasUTM) {
            // Last Click Attribution: Overwrite existing data
            localStorage.setItem('tracking_data', JSON.stringify(trackingData));
            console.log("UTM Tracking Updated:", trackingData);
        }
    }, [location]);

    return null; // Invisible component
};
