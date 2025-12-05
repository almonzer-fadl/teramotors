"use client";

import { useEffect } from 'react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { HelpCircle } from 'lucide-react';

export default function Tour() {

    const startTour = () => {
        const driverObj = driver({
            showProgress: true,
            animate: true,
            steps: [
                { 
                    element: '#tour-step-1-logo', 
                    popover: { 
                        title: 'Your Brand', 
                        description: 'Your logo appears here. You can change it in the Company Profile settings.' 
                    } 
                },
                { 
                    element: '#tour-step-2-theme-toggle', 
                    popover: { 
                        title: 'Light & Dark Mode', 
                        description: 'Switch between light and dark themes for the entire application.' 
                    } 
                },
                { 
                    element: '#tour-step-3-nav-button', 
                    popover: { 
                        title: 'Navigation Menu', 
                        description: 'Click this button to open the navigation menu. You can drag it anywhere on the screen!' 
                    } 
                },
                {
                    element: '#tour-step-4-add-customer',
                    popover: {
                        title: 'Create Your First Record',
                        description: 'Use the "Add" buttons on pages like Customers or Vehicles to start populating your workshop data.'
                    }
                }
            ]
        });

        driverObj.drive();
    }

    return (
        <button 
            onClick={startTour} 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium px-4 py-2.5 rounded-lg hover:bg-gray-500/5"
        >
            <HelpCircle className="h-4 w-4" />
            Start Tour
        </button>
    );
}
