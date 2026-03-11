import { useEffect, useState } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import HeroSlider from "../../home/HeroSlider";
import FeaturedLessons from "../../home/FeaturedLessons";
import TopContributors from "../../home/TopContributors";
import WhyLearningMatters from "../../home/WhyLearningMatters";
import MostSavedLessons from "../../home/MostSavedLessons";
import StatisticsSection from "./StatisticsSection";
import CategoriesSection from "./CategoriesSection";
import HowItWorksSection from "./HowItWorksSection";

const Home = () => {
    const axiosSecure = useAxiosSecure();

    const [featuredLessons, setFeaturedLessons] = useState([]);
    const [topContributors, setTopContributors] = useState([]);
    const [mostSavedLessons, setMostSavedLessons] = useState([]);
    const [stats, setStats] = useState({
        totalLessons: 0,
        publicLessons: 0,
        totalContributors: 0,
        totalUsers: 0,
    });

    const safeArray = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.lessons)) return data.lessons;
        if (Array.isArray(data?.contributors)) return data.contributors;
        return [];
    };

    useEffect(() => {
        axiosSecure
            .get("/lessons/featured")
            .then((res) => setFeaturedLessons(safeArray(res.data)))
            .catch(() => setFeaturedLessons([]));

        axiosSecure
            .get("/stats/top-contributors")
            .then((res) => setTopContributors(safeArray(res.data)))
            .catch(() => setTopContributors([]));

        axiosSecure
            .get("/lessons/most-saved")
            .then((res) => setMostSavedLessons(safeArray(res.data)))
            .catch(() => setMostSavedLessons([]));

        axiosSecure
            .get("/stats/home")
            .then((res) =>
                setStats(
                    res.data || {
                        totalLessons: 0,
                        publicLessons: 0,
                        totalContributors: 0,
                        totalUsers: 0,
                    }
                )
            )
            .catch(() =>
                setStats({
                    totalLessons: 0,
                    publicLessons: 0,
                    totalContributors: 0,
                    totalUsers: 0,
                })
            );
    }, [axiosSecure]);

    return (
        <div className="bg-base-100">
            <HeroSlider />
            <StatisticsSection stats={stats} />
            <CategoriesSection />
            <FeaturedLessons lessons={featuredLessons} />
            <HowItWorksSection />
            <WhyLearningMatters />
            <TopContributors contributors={topContributors} />
            <MostSavedLessons lessons={mostSavedLessons} />
        </div>
    );
};

export default Home;