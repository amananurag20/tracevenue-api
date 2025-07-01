const {
  inviteVendor,
  suggestionNotification,
  suggestionRemoved,
} = require("../../../events/communication");
const Job = require("../models/jobs.model");
const { validateObjectId } = require("../../../utils/mongoose.helper");
const User = require("../../../models/User");
const Notification = require("../../notification/models/notification");
const Restaurant = require("../../../models/RestaurantModels");
const Events = require("../models/events.model");
const Chat = require("../models/chat.model");
const mongoose = require("mongoose");
const Variant = require("../models/variant.model");
const Package = require("../models/package.model");

// Create new job
const createJobController = async (req, res) => {
  try {
    const {
      name,
      userId,
      restaurant_id = [],
      menuSections,
      serviceType,
      services,
      eventDate,
      eventType,
      cuisines,
      status,
      specialRequirements,
      variants = [],
      peopleRange,
      budget,
    } = req.body;
    // Validate required fields
    if (
      (!name ||
        !userId ||
        !menuSections ||
        !eventDate ||
        !eventType ||
        !cuisines ||
        !budget ||
        !peopleRange?.maxPeople) &&
      status !== "Draft"
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Calculate itemCount for each section
    const processedMenuSections =
      menuSections?.length > 0
        ? menuSections.map((section) => ({
            ...section,
            itemCount: section.items.length,
          }))
        : [];

    // Process variants to match the new schema structure
    const processedVariants = variants.map((variantId) => ({
      variant_id: variantId?.variant_id,
      isShortlisted: false,
      isRejected: false,
    }));

    const job = new Job({
      ...req.body,
      menuSections: processedMenuSections || [],
      variants: processedVariants || [],
      publishedAt: new Date(),
    });

    await job.save();

    // Populate the references for response
    const populatedJob =
      status === "Draft"
        ? job
        : await Job.findById(job._id)
            .populate("userId", "userName email phoneNumber")
            .populate("eventType", "eventName")
            .populate("cuisines", "name")
            .populate("services")
            .populate("restaurant_id", "restaurantName email phoneNumber")
            .populate("menuSections.category", "name")
            .populate("menuSections.items.item", "name description")
            .populate("variants.variant_id");

    res.status(201).json({
      success: true,
      data: populatedJob,
      jobId: job?._id,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// const getJobsController = async (req, res) => {
//   try {
//     const {
//       restaurant_id,
//       status = "Active",

//       page,
//       limit,
//       sortingType = "newest_first",
//       eventType,
//       serviceType,
//       budgetType,
//       budget,
//       numberOfPersons,
//       customerLocation,
//       customerInfo,
//       searchTerm,
//       includeMetadata = true,
//       tabType, // NEW
//       resId, // NEW (restaurant ID for filtering saved/invited/past)
//       cuisines,
//       numberOfProposals,
//       eventDateRange,
//     } = req.body;
//     const numberOfProposalAsString = numberOfProposals?.length
//       ? numberOfProposals[0]?.toString()
//       : "";
//     let query = {};

//     const getCurrentDate = () => {
//       const today = new Date();
//       return today.toISOString().split('T')[0];
//     };

//     const currentDate = getCurrentDate();

//     // Extract all start and end dates
//     const allDates = eventDateRange.flatMap(range => [range.start, range.end]);

//     // Find the minimum (earliest) date
//     let fromDate = allDates.reduce((min, date) => date < min ? date : min, allDates[0]);

//     // Find the maximum (latest) date
//     const toDate = allDates.reduce((max, date) => date > max ? date : max, allDates[0]);

//     // If fromDate is in the past, set it to current date
//     if (fromDate < currentDate) {
//       fromDate = currentDate;
//     }

//     console.log('fromDate:', fromDate); // Will be current date if any range starts in the past
//     console.log('toDate:', toDate);     // "2025-06-30"

//     // Apply basic filters
//     if (restaurant_id) query.restaurant_id = restaurant_id;
//     if (status) query.status = query.status ? query.status : { $ne: "Draft" };
//     if (fromDate && toDate) {
//       query.eventDate = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate),
//       };
//     }

//     // Event Type filter
//     if (eventType && eventType.length > 0) {
//       const eventTypes = await Events.find({
//         eventName: { $in: eventType },
//       });
//       query.eventType = { $in: eventTypes.map((event) => event._id) };
//     }

//     // Service Type filter
//     if (serviceType && serviceType.length > 0) {
//       query.serviceType = { $in: serviceType };
//     }

//     // Budget per person
//     if (budgetType) {
//       query.budgetType = budgetType;
//     }

//     // Budget filter
//     if (budget && budget.length > 0) {
//       const budgetRanges = {
//         under_100: { min: 0, max: 100 },
//         "100_500": { min: 100, max: 500 },
//         "500_1000": { min: 500, max: 1000 },
//         "1000_5000": { min: 1000, max: 5000 },
//         "5000_plus": { min: 5000, max: Infinity },
//       };

//       const budgetConditions = budget.map((key) => {
//         const range = budgetRanges[key];
//         return {
//           $and: [
//             { "budget.min": { $gte: range.min } },
//             { "budget.max": { $lte: range.max } },
//           ],
//         };
//       });

//       if (budgetConditions.length > 0) {
//         query.$or = query.$or || [];
//         query.$or.push(...budgetConditions);
//       }
//     }

//     // Number of persons filter
//     if (numberOfPersons && numberOfPersons.length > 0) {
//       const peopleRanges = {
//         under_10: { min: 0, max: 10 },
//         "10_50": { min: 10, max: 50 },
//         "50_100": { min: 50, max: 100 },
//         "100_500": { min: 100, max: 500 },
//         "500_plus": { min: 500, max: Infinity },
//       };

//       const peopleConditions = numberOfPersons.map((key) => {
//         const range = peopleRanges[key];
//         return {
//           $and: [
//             { "peopleRange.minPeople": { $gte: range.min } },
//             { "peopleRange.maxPeople": { $lte: range.max } },
//           ],
//         };
//       });

//       if (peopleConditions.length > 0) {
//         query.$or = query.$or || [];
//         query.$or.push(...peopleConditions);
//       }
//     }
//     // Cuisines filter - NEW
//     if (cuisines && cuisines.length > 0) {
//       query.cuisines = { $in: cuisines };
//     }
//     // Number of Proposals filter (based on variants array length) - NEW
//     if (numberOfProposalAsString) {
//       const proposalRanges = {
//         less_than_5: { min: 0, max: 4 },
//         "5-10": { min: 5, max: 10 },
//         "10-15": { min: 10, max: 15 },
//         more_than_15: { min: 16, max: Infinity },
//       };

//       const range = proposalRanges[numberOfProposalAsString];
//       if (range) {
//         if (range.max === Infinity) {
//           query.$expr = query.$expr
//             ? {
//               $and: [
//                 query.$expr,
//                 { $gte: [{ $size: "$variants" }, range.min] },
//               ],
//             }
//             : { $gte: [{ $size: "$variants" }, range.min] };
//         } else {
//           query.$expr = query.$expr
//             ? {
//               $and: [
//                 query.$expr,
//                 {
//                   $and: [
//                     { $gte: [{ $size: "$variants" }, range.min] },
//                     { $lte: [{ $size: "$variants" }, range.max] },
//                   ],
//                 },
//               ],
//             }
//             : {
//               $and: [
//                 { $gte: [{ $size: "$variants" }, range.min] },
//                 { $lte: [{ $size: "$variants" }, range.max] },
//               ],
//             };
//         }
//       }
//     }
//     if (customerLocation?.length > 0) {
//       query["selectedCities.name"] = {
//         $in: customerLocation?.map((city) => city?.name),
//       };
//     }

//     // Customer Info
//     if (customerInfo === true) {
//       query.status = "Closed";
//       query.restaurant_id = { $in: [restaurant_id] };
//     }

//     // Search term
//     if (searchTerm) {
//       query.name = { $regex: searchTerm, $options: "i" };
//     }

//     // Tab-type-based filtering
//     if (tabType) {
//       switch (tabType) {
//         case "nav-savedjobs":
//           if (resId) {
//             query.isSaved = { $in: [resId] };
//             query.status = { $ne: "Draft" };
//           }
//           break;

//         case "nav-invitedjobs":
//           if (resId) {
//             query.restaurant_id = { $in: [resId] };
//             query.status = { $ne: "Draft" };
//           }
//           break;

//         case "nav-activejobs":
//           query.status = "Active";
//           query.restaurant_id = { $in: [resId] };
//           query.userId = { $ne: null };
//           break;

//         case "nav-pastjobs":
//           if (resId) {
//             query.status = "Closed";
//             query.restaurant_id = { $in: [resId] };
//           }
//           break;

//         case "nav-alljobs":
//           if (
//             !status &&
//             !restaurant_id &&
//             !fromDate &&
//             !toDate &&
//             (!eventType || eventType.length === 0) &&
//             (!serviceType || serviceType.length === 0) &&
//             !budgetType &&
//             (!budget || budget.length === 0) &&
//             (!numberOfPersons || numberOfPersons.length === 0) &&
//             (!customerLocation || customerLocation.length === 0) &&
//             !customerInfo &&
//             (!searchTerm || searchTerm.trim() === "") &&
//             !cuisines &&
//             !numberOfProposalAsString
//           ) {
//             query = { status: { $ne: "Draft" } };
//           }
//           break;
//         default:
//           break;
//       }
//     }

//     // Sort logic
//     const sortOptions = {};
//     sortOptions.publishedAt = sortingType === "oldest_first" ? 1 : -1;

//     // Initial query setup
//     let jobsQuery = Job.find(query)
//       .populate("userId", "userName email phoneNumber profileImage")
//       .populate("eventType", "eventName")
//       .populate("cuisines", "name")
//       .populate("services")
//       .populate("restaurant_id", "restaurantName email phoneNumber")
//       .populate("variants.variant_id")
//       .sort(sortOptions);

//     let totalJobs;
//     let jobs;
//     let allCities = [];
//     let availableEvents = [];

//     // Fetch all jobs for metadata (not filtered!)
//     if (includeMetadata) {
//       const allJobs = await Job.find({})
//         .populate("eventType", "eventName _id")
//         .lean();

//       const cityMap = new Map();

//       allJobs.forEach((job) => {
//         (job.selectedCities || []).forEach((city) => {
//           if (city?.name && !cityMap.has(city.name)) {
//             cityMap.set(city.name, city); // could use `${city.name}-${city.latitude}` if needed
//           }
//         });
//       });

//       allCities = Array.from(cityMap.values());

//       const uniqueEventTypesMap = new Map();
//       allJobs.forEach((job) => {
//         const event = job.eventType;
//         if (event && !uniqueEventTypesMap.has(event._id.toString())) {
//           uniqueEventTypesMap.set(event._id.toString(), event);
//         }
//       });

//       availableEvents = Array.from(uniqueEventTypesMap.values());
//     }

//     const isPaginated = page !== undefined || limit !== undefined;

//     if (isPaginated) {
//       const pageNum = parseInt(page, 10) || 1;
//       const limitNum = parseInt(limit, 10) || 10;
//       const skip = (pageNum - 1) * limitNum;

//       totalJobs = await Job.countDocuments(query);
//       jobs = await jobsQuery.skip(skip).limit(limitNum);

//       const totalPages = Math.ceil(totalJobs / limitNum);

//       return res.status(200).json({
//         success: true,
//         count: totalJobs,
//         pagination: {
//           currentPage: pageNum,
//           totalPages,
//           pageSize: limitNum,
//           totalItems: totalJobs,
//           hasNextPage: pageNum < totalPages,
//           hasPrevPage: pageNum > 1,
//         },
//         metadata: includeMetadata
//           ? {
//             allCities,
//             availableEvents,
//           }
//           : undefined,
//         data: jobs,
//       });
//     } else {
//       jobs = await jobsQuery;

//       return res.status(200).json({
//         success: true,
//         count: jobs.length,
//         metadata: includeMetadata
//           ? {
//             allCities,
//             availableEvents,
//           }
//           : undefined,
//         data: jobs,
//       });
//     }
//   } catch (error) {
//     console.error("Error in getJobsController:", error);
//     return res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// };

const getJobsController = async (req, res) => {
  try {
    const {
      restaurant_id,
      status = "Active",
      page,
      limit,
      sortingType = "newest_first",
      eventType,
      serviceType,
      budgetType,
      budget,
      numberOfPersons,
      customerLocation,
      customerInfo,
      searchTerm,
      includeMetadata = true,
      tabType,
      resId,
      cuisines,
      numberOfProposals,
      eventDateRange,
    } = req.body;

    const numberOfProposalAsString = numberOfProposals?.length
      ? numberOfProposals[0]?.toString()
      : "";
    let query = {};

    // Date range calculation
    let fromDate, toDate;
    if (eventDateRange && eventDateRange.length > 0) {
      const getCurrentDate = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
      };
      const currentDate = getCurrentDate();

      // Extract all start and end dates and convert to date-only format (YYYY-MM-DD)
      const allDates = eventDateRange.flatMap((range) => [
        range.start.split("T")[0], // Extract just the date part
        range.end.split("T")[0], // Extract just the date part
      ]);

      // Find the minimum (earliest) date
      fromDate = allDates.reduce(
        (min, date) => (date < min ? date : min),
        allDates[0]
      );

      // Find the maximum (latest) date
      toDate = allDates.reduce(
        (max, date) => (date > max ? date : max),
        allDates[0]
      );

      // If fromDate is in the past, set it to current date
      if (fromDate < currentDate) {
        fromDate = currentDate;
      }
    }

    // Apply basic filters
    if (restaurant_id) query.restaurant_id = restaurant_id;
    if (status) query.status = query.status ? query.status : { $ne: "Draft" };

    // Date filtering - optimized for your eventDate format
    if (fromDate && toDate) {
      const startDate = new Date(fromDate);
      const endDate = new Date(toDate);

      query.$expr = {
        $gt: [
          {
            $size: {
              $filter: {
                input: "$eventDate",
                as: "dateObj",
                cond: {
                  $let: {
                    vars: {
                      dateStr: {
                        $arrayElemAt: [{ $objectToArray: "$$dateObj" }, 0],
                      },
                    },
                    in: {
                      $and: [
                        { $gte: [{ $toDate: "$$dateStr.k" }, startDate] },
                        { $lte: [{ $toDate: "$$dateStr.k" }, endDate] },
                      ],
                    },
                  },
                },
              },
            },
          },
          0,
        ],
      };
    }

    // Event Type filter
    if (eventType && eventType.length > 0) {
      const eventTypes = await Events.find({
        eventName: { $in: eventType },
      });
      query.eventType = { $in: eventTypes.map((event) => event._id) };
    }

    // Service Type filter
    if (serviceType && serviceType.length > 0) {
      query.serviceType = { $in: serviceType };
    }

    // Budget per person
    if (budgetType) {
      query.budgetType = budgetType;
    }

    // Budget filter
    if (budget && budget.length > 0) {
      const budgetRanges = {
        under_100: { min: 0, max: 100 },
        "100_500": { min: 100, max: 500 },
        "500_1000": { min: 500, max: 1000 },
        "1000_5000": { min: 1000, max: 5000 },
        "5000_plus": { min: 5000, max: Infinity },
      };

      const budgetConditions = budget.map((key) => {
        const range = budgetRanges[key];
        return {
          $and: [
            { "budget.min": { $gte: range.min } },
            { "budget.max": { $lte: range.max } },
          ],
        };
      });

      if (budgetConditions.length > 0) {
        query.$or = query.$or || [];
        query.$or.push(...budgetConditions);
      }
    }

    // Number of persons filter
    if (numberOfPersons && numberOfPersons.length > 0) {
      const peopleRanges = {
        under_10: { min: 0, max: 10 },
        "10_50": { min: 10, max: 50 },
        "50_100": { min: 50, max: 100 },
        "100_500": { min: 100, max: 500 },
        "500_plus": { min: 500, max: Infinity },
      };

      const peopleConditions = numberOfPersons.map((key) => {
        const range = peopleRanges[key];
        return {
          $and: [
            { "peopleRange.minPeople": { $gte: range.min } },
            { "peopleRange.maxPeople": { $lte: range.max } },
          ],
        };
      });

      if (peopleConditions.length > 0) {
        query.$or = query.$or || [];
        query.$or.push(...peopleConditions);
      }
    }

    // Cuisines filter
    if (cuisines && cuisines.length > 0) {
      query.cuisines = { $in: cuisines };
    }

    // Number of Proposals filter
    if (numberOfProposalAsString) {
      const proposalRanges = {
        less_than_5: { min: 0, max: 4 },
        "5-10": { min: 5, max: 10 },
        "10-15": { min: 10, max: 15 },
        more_than_15: { min: 16, max: Infinity },
      };

      const range = proposalRanges[numberOfProposalAsString];
      if (range) {
        if (range.max === Infinity) {
          query.$expr = query.$expr
            ? {
                $and: [
                  query.$expr,
                  { $gte: [{ $size: "$variants" }, range.min] },
                ],
              }
            : { $gte: [{ $size: "$variants" }, range.min] };
        } else {
          query.$expr = query.$expr
            ? {
                $and: [
                  query.$expr,
                  {
                    $and: [
                      { $gte: [{ $size: "$variants" }, range.min] },
                      { $lte: [{ $size: "$variants" }, range.max] },
                    ],
                  },
                ],
              }
            : {
                $and: [
                  { $gte: [{ $size: "$variants" }, range.min] },
                  { $lte: [{ $size: "$variants" }, range.max] },
                ],
              };
        }
      }
    }

    // Customer Location filter
    if (customerLocation?.length > 0) {
      query["selectedCities.name"] = {
        $in: customerLocation?.map((city) => city?.name),
      };
    }

    // Customer Info filter
    if (customerInfo === true) {
      query.status = "Closed";
      query.restaurant_id = { $in: [restaurant_id] };
    }

    // Search term filter
    if (searchTerm) {
      query.name = { $regex: searchTerm, $options: "i" };
    }

    // Tab-type-based filtering
    if (tabType) {
      switch (tabType) {
        case "nav-savedjobs":
          if (resId) {
            query.isSaved = { $in: [resId] };
            query.status = { $ne: "Draft" };
          }
          break;

        case "nav-invitedjobs":
          if (resId) {
            query.restaurant_id = { $in: [resId] };
            query.status = { $ne: "Draft" };
          }
          break;

        case "nav-activejobs":
          query.status = "Active";
          query.restaurant_id = { $in: [resId] };
          query.userId = { $ne: null };
          break;

        case "nav-pastjobs":
          if (resId) {
            query.status = "Closed";
            query.restaurant_id = { $in: [resId] };
          }
          break;

        case "nav-alljobs":
          if (
            !status &&
            !restaurant_id &&
            (!fromDate || !toDate) &&
            (!eventType || eventType.length === 0) &&
            (!serviceType || serviceType.length === 0) &&
            !budgetType &&
            (!budget || budget.length === 0) &&
            (!numberOfPersons || numberOfPersons.length === 0) &&
            (!customerLocation || customerLocation.length === 0) &&
            !customerInfo &&
            (!searchTerm || searchTerm.trim() === "") &&
            !cuisines &&
            !numberOfProposalAsString
          ) {
            query = { status: { $ne: "Draft" } };
          }
          break;
        default:
          break;
      }
    }

    // Sort logic
    let sortOptions = {};

    if (sortingType === "oldest_first") {
      sortOptions.publishedAt = 1;
    } else if (sortingType === "newest_first") {
      sortOptions.publishedAt = -1;
    } else if (sortingType === "ascending") {
      sortOptions.name = 1; // Alphabetical A-Z
    } else if (sortingType === "descending") {
      sortOptions.name = -1; // Alphabetical Z-A
    }

    // Initial query setup
    let jobsQuery = Job.find(query)
      .populate("userId", "userName email phoneNumber profileImage")
      .populate("eventType", "eventName")
      .populate("cuisines", "name")
      .populate("services")
      .populate("restaurant_id", "restaurantName email phoneNumber")
      .populate("variants.variant_id")
      .sort(sortOptions);

    let totalJobs;
    let jobs;
    let allCities = [];
    let availableEvents = [];

    // Fetch all jobs for metadata (not filtered!)
    if (includeMetadata) {
      const allJobs = await Job.find({})
        .populate("eventType", "eventName _id")
        .lean();

      const cityMap = new Map();
      allJobs.forEach((job) => {
        (job.selectedCities || []).forEach((city) => {
          if (city?.name && !cityMap.has(city.name)) {
            cityMap.set(city.name, city);
          }
        });
      });
      allCities = Array.from(cityMap.values());

      const uniqueEventTypesMap = new Map();
      allJobs.forEach((job) => {
        const event = job.eventType;
        if (event && !uniqueEventTypesMap.has(event._id.toString())) {
          uniqueEventTypesMap.set(event._id.toString(), event);
        }
      });
      availableEvents = Array.from(uniqueEventTypesMap.values());
    }

    const isPaginated = page !== undefined || limit !== undefined;

    if (isPaginated) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const skip = (pageNum - 1) * limitNum;

      totalJobs = await Job.countDocuments(query);
      jobs = await jobsQuery.skip(skip).limit(limitNum);

      const totalPages = Math.ceil(totalJobs / limitNum);

      return res.status(200).json({
        success: true,
        count: totalJobs,
        pagination: {
          currentPage: pageNum,
          totalPages,
          pageSize: limitNum,
          totalItems: totalJobs,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
        metadata: includeMetadata
          ? {
              allCities,
              availableEvents,
            }
          : undefined,
        data: jobs,
      });
    } else {
      jobs = await jobsQuery;
      return res.status(200).json({
        success: true,
        count: jobs.length,
        metadata: includeMetadata
          ? {
              allCities,
              availableEvents,
            }
          : undefined,
        data: jobs,
      });
    }
  } catch (error) {
    console.error("Error in getJobsController:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
// Optimized helper function to check applied jobs in batch
const getAppliedJobsMap = async (jobIds, venueId) => {
  try {
    if (!jobIds.length || !venueId) return new Map();

    // Step 1: Get all variant_ids for all jobs in one query
    const jobs = await Job.find({ _id: { $in: jobIds } })
      .select("variants")
      .lean();

    if (!jobs.length) return new Map();

    // Step 2: Get all packageIds for this venue in one query
    const packages = await Package.find({ venueId }).select("_id").lean();

    if (!packages.length) return new Map();

    const packageIds = packages.map((pkg) => pkg._id);

    // Step 3: Get all venue variants in one query
    const venueVariants = await Variant.find({
      packageId: { $in: packageIds },
    })
      .select("_id")
      .lean();

    if (!venueVariants.length) return new Map();

    // Create a Set of venue variant IDs for faster lookup
    const venueVariantIds = new Set(
      venueVariants.map((variant) => variant._id.toString())
    );

    // Step 4: Check each job against venue variants
    const appliedJobsMap = new Map();

    jobs.forEach((job) => {
      const jobVariantIds =
        job.variants?.map((variant) => variant.variant_id?.toString()) || [];
      const autoApplied = job.variants?.filter(
        (variant) => variant.autoApply === true
      );
      const autoAppliedIds =
        autoApplied?.map((variant) => variant.variant_id?.toString()) || [];
      const isApplied = jobVariantIds.some((variantId) =>
        venueVariantIds.has(variantId)
      );

      const isAutoApplied = autoAppliedIds.some((variantId) =>
        venueVariantIds.has(variantId)
      );

      appliedJobsMap.set(job._id.toString(), {
        isApplied,
        autoApplied: isAutoApplied,
      });
    });

    return appliedJobsMap;
  } catch (error) {
    console.error("Error in getAppliedJobsMap:", error);
    return new Map();
  }
};

const getAllFilteredJobs = async (req, res) => {
  try {
    const {
      restaurant_id,
      status = "Active",
      page,
      limit,
      sortingType = "newest_first",
      eventType,
      serviceType,
      budgetType,
      budget,
      numberOfPersons,
      customerLocation,
      customerInfo,
      searchTerm,
      tabType,
      resId,
      cuisines,
      numberOfProposals,
      eventDateRange,   
      selectedCities
    } = req.body;

    const numberOfProposalAsString = numberOfProposals?.length
      ? numberOfProposals[0]?.toString()
      : "";

    let query = {};

    let fromDate, toDate;
    if (eventDateRange && eventDateRange.length > 0) {
      const getCurrentDate = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
      };
      const currentDate = getCurrentDate();

      // Extract all start and end dates and convert to date-only format (YYYY-MM-DD)
      const allDates = eventDateRange.flatMap((range) => [
        range.start.split("T")[0], // Extract just the date part
        range.end.split("T")[0], // Extract just the date part
      ]);

      // Find the minimum (earliest) date
      fromDate = allDates.reduce(
        (min, date) => (date < min ? date : min),
        allDates[0]
      );

      // Find the maximum (latest) date
      toDate = allDates.reduce(
        (max, date) => (date > max ? date : max),
        allDates[0]
      );

      // If fromDate is in the past, set it to current date
      if (fromDate < currentDate) {
        fromDate = currentDate;
      }
    }

    // Date filtering - optimized for your eventDate format
    const includeMetadata = tabType === "nav-alljobs";
    let filterByAppliedJobs = false;

    // Apply basic filters
    if (restaurant_id) query.restaurant_id = restaurant_id;
    // closed and draft not included
    if (status)
      query.status = query.status
        ? query.status
        : { $nin: ["Closed", "Draft"] };
    if (fromDate && toDate) {
      const startDate = new Date(fromDate);
      const endDate = new Date(toDate);

      query.$expr = {
        $gt: [
          {
            $size: {
              $filter: {
                input: "$eventDate",
                as: "dateObj",
                cond: {
                  $let: {
                    vars: {
                      dateStr: {
                        $arrayElemAt: [{ $objectToArray: "$$dateObj" }, 0],
                      },
                    },
                    in: {
                      $and: [
                        { $gte: [{ $toDate: "$$dateStr.k" }, startDate] },
                        { $lte: [{ $toDate: "$$dateStr.k" }, endDate] },
                      ],
                    },
                  },
                },
              },
            },
          },
          0,
        ],
      };
    }

    // Event Type filter
    if (eventType && eventType.length > 0) {
      const eventTypes = await Events.find({
        eventName: { $in: eventType },
      })
        .select("_id")
        .lean();
      query.eventType = { $in: eventTypes.map((event) => event._id) };
    }

    // Service Type filter
    if (serviceType && serviceType.length > 0) {
      query.serviceType = { $in: serviceType };
    }

    // Budget per person
    if (budgetType) {
      query.budgetType = budgetType;
    }

    // Budget filter
    if (budget && budget.length > 0) {
      const budgetRanges = {
        under_100: { min: 0, max: 100 },
        "100_500": { min: 100, max: 500 },
        "500_1000": { min: 500, max: 1000 },
        "1000_5000": { min: 1000, max: 5000 },
        "5000_plus": { min: 5000, max: Infinity },
      };

      const budgetConditions = budget.map((key) => {
        const range = budgetRanges[key];
        return {
          $and: [
            { "budget.min": { $gte: range.min } },
            { "budget.max": { $lte: range.max } },
          ],
        };
      });

      if (budgetConditions.length > 0) {
        query.$or = query.$or || [];
        query.$or.push(...budgetConditions);
      }
    }

    // Number of persons filter
    if (numberOfPersons && numberOfPersons.length > 0) {
      const peopleRanges = {
        under_10: { min: 0, max: 10 },
        "10_50": { min: 10, max: 50 },
        "50_100": { min: 50, max: 100 },
        "100_500": { min: 100, max: 500 },
        "500_plus": { min: 500, max: Infinity },
      };

      const peopleConditions = numberOfPersons.map((key) => {
        const range = peopleRanges[key];
        return {
          $and: [
            { "peopleRange.minPeople": { $gte: range.min } },
            { "peopleRange.maxPeople": { $lte: range.max } },
          ],
        };
      });

      if (peopleConditions.length > 0) {
        query.$or = query.$or || [];
        query.$or.push(...peopleConditions);
      }
    }

    // Cuisines filter
    if (cuisines && cuisines.length > 0) {
      query.cuisines = { $in: cuisines };
    }

    // Number of Proposals filter
    if (numberOfProposalAsString) {
      const proposalRanges = {
        less_than_5: { min: 0, max: 4 },
        "5-10": { min: 5, max: 10 },
        "10-15": { min: 10, max: 15 },
        more_than_15: { min: 16, max: Infinity },
      };

      const range = proposalRanges[numberOfProposalAsString];
      if (range) {
        if (range.max === Infinity) {
          query.$expr = query.$expr
            ? {
                $and: [
                  query.$expr,
                  { $gte: [{ $size: "$variants" }, range.min] },
                ],
              }
            : { $gte: [{ $size: "$variants" }, range.min] };
        } else {
          query.$expr = query.$expr
            ? {
                $and: [
                  query.$expr,
                  {
                    $and: [
                      { $gte: [{ $size: "$variants" }, range.min] },
                      { $lte: [{ $size: "$variants" }, range.max] },
                    ],
                  },
                ],
              }
            : {
                $and: [
                  { $gte: [{ $size: "$variants" }, range.min] },
                  { $lte: [{ $size: "$variants" }, range.max] },
                ],
              };
        }
      }
    }

    // Combine customerLocation and selectedCities filters
    const cityFilterList = [
      ...(customerLocation?.map((city) => city?.name) || []),
      ...(selectedCities || [])
    ];
    
    if (cityFilterList.length > 0) {
      query["selectedCities.name"] = { $in: cityFilterList };
    }

    // Customer Info
    if (customerInfo === true) {
      query.status = "Closed";
      query.restaurant_id = { $in: [restaurant_id] };
    }

    // Search term
    if (searchTerm) {
      query.name = { $regex: searchTerm, $options: "i" };
    }

    // Tab-type-based filtering
    if (tabType) {
      switch (tabType) {
        case "nav-savedjobs":
          if (resId) {
            query.isSaved = { $in: [resId] };
            query.status = { $ne: "Draft" };
          }
          break;

        case "nav-invitedjobs":
          if (resId) {
            query.restaurant_id = { $in: [resId] };
            query.status = { $nin: ["Closed", "Draft"] };
          }
          break;

        case "nav-activejobs":
          query.status = { $nin: ["Closed", "Draft"] };
          query.userId = { $ne: null };
          filterByAppliedJobs = true;
          break;

        case "nav-chats":
          query.status = { $ne: "Draft" };
          filterByAppliedJobs = true;
          break;

        case "nav-chats-active":
          query.status = "Active";
          query.userId = { $ne: null };
          filterByAppliedJobs = true;
          break;

        case "nav-pastjobs":
          if (resId) {
            query.status = "Closed";
            query.restaurant_id = { $in: [resId] };
          }
          break;

        case "nav-alljobs":
          if (
            !status &&
            !restaurant_id &&
            !fromDate &&
            !toDate &&
            (!eventType || eventType.length === 0) &&
            (!serviceType || serviceType.length === 0) &&
            !budgetType &&
            (!budget || budget.length === 0) &&
            (!numberOfPersons || numberOfPersons.length === 0) &&
            (!customerLocation || customerLocation.length === 0) &&
            !customerInfo &&
            (!searchTerm || searchTerm.trim() === "") &&
            !cuisines &&
            !numberOfProposalAsString
          ) {
            query = { status: { $nin: ["Closed", "Draft"] } };
          }
          break;
        default:
          break;
      }
    }

    let sortOptions = {};

    if (sortingType === "oldest_first") {
      sortOptions.publishedAt = 1;
    } else if (sortingType === "newest_first") {
      sortOptions.publishedAt = -1;
    } else if (sortingType === "ascending") {
      sortOptions.name = 1; // Alphabetical A-Z
    } else if (sortingType === "descending") {
      sortOptions.name = -1; // Alphabetical Z-A
    }

    // Pagination setup
    const isPaginated = page !== undefined || limit !== undefined;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    let totalJobs;
    let jobs;
    let allCities = [];
    let availableEvents = [];

    // Fetch metadata if needed (optimized)
    if (includeMetadata) {
      const [allJobsForMetadata] = await Promise.all([
        Job.find({})
          .select("selectedCities eventType")
          .populate("eventType", "eventName _id")
          .lean(),
      ]);

      const cityMap = new Map();
      const uniqueEventTypesMap = new Map();

      allJobsForMetadata.forEach((job) => {
        // Process cities
        (job.selectedCities || []).forEach((city) => {
          if (city?.name && !cityMap.has(city.name)) {
            cityMap.set(city.name, city);
          }
        });

        // Process events
        const event = job.eventType;
        if (event && !uniqueEventTypesMap.has(event._id.toString())) {
          uniqueEventTypesMap.set(event._id.toString(), event);
        }
      });

      allCities = Array.from(cityMap.values());
      availableEvents = Array.from(uniqueEventTypesMap.values());
    }

    // Build the job query
    let jobsQuery = Job.find(query)
      .populate("userId", "userName profileImage")
      .populate("eventType", "eventName")
      .populate("cuisines", "name")
      .populate("services")
      .populate("restaurant_id", "restaurantName email phoneNumber")
      .populate("variants.variant_id")
      .sort(sortOptions);

    // Handle filtering by applied jobs
    if (filterByAppliedJobs) {
      // Get all jobs that match the query first
      jobs = await jobsQuery.lean();

      // Get applied jobs map in batch
      const jobIds = jobs.map((job) => job._id);
      const appliedJobsMap = await getAppliedJobsMap(jobIds, resId);

      // Filter only applied jobs
      jobs = jobs.filter(
        (job) => appliedJobsMap.get(job._id.toString())?.isApplied
      );

      // Handle pagination for filtered results
      if (isPaginated && tabType !== "nav-chats") {
        totalJobs = jobs.length;
        const paginatedJobs = jobs.slice(skip, skip + limitNum);
        const totalPages = Math.ceil(totalJobs / limitNum);

        const formattedJobs = paginatedJobs.map((job) => ({
          name: job?.name,
          peopleRange: job?.peopleRange,
          budget: job?.budget,
          eventType: job?.eventType,
          eventDateOptions: job?.eventDateOptions,
          selectedCities: job?.selectedCities,
          variants: job?.variants?.map((variant) => variant?.variant_id),
          _id: job?._id,
          radius: job?.radius,
          publishedAt: job?.publishedAt,
          specialRequirements: job?.specialRequirements,
          status: job?.status,
          budgetType: job?.budgetType,
          matchedPercentage: job?.matched?.[0]?.[0]?.venue_matches || [],
          cuisines: job?.cuisines,
          isSaved: job?.isSaved,
          userId: job?.userId,
          isApplied: appliedJobsMap.get(job._id.toString()),
        }));

        return res.status(200).json({
          success: true,
          count: totalJobs,
          pagination: {
            currentPage: pageNum,
            totalPages,
            pageSize: limitNum,
            totalItems: totalJobs,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
          },
          metadata: includeMetadata
            ? { allCities, availableEvents }
            : undefined,
          data: formattedJobs,
        });
      } else {
        const formattedJobs = jobs.map((job) => ({
          name: job?.name,
          peopleRange: job?.peopleRange,
          budget: job?.budget,
          eventType: job?.eventType,
          eventDateOptions: job?.eventDateOptions,
          selectedCities: job?.selectedCities,
          variants: job?.variants?.map((variant) => variant?.variant_id),
          _id: job?._id,
          radius: job?.radius,
          publishedAt: job?.publishedAt,
          specialRequirements: job?.specialRequirements,
          status: job?.status,
          budgetType: job?.budgetType,
          matchedPercentage: job?.matched?.[0]?.[0]?.venue_matches || [],
          cuisines: job?.cuisines,
          isSaved: job?.isSaved,
          userId: job?.userId,
          isApplied: true, // All jobs here are applied
        }));

        return res.status(200).json({
          success: true,
          count: formattedJobs.length,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            pageSize: formattedJobs.length,
            totalItems: formattedJobs.length,
            hasNextPage: false,
            hasPrevPage: false,
          },
          metadata: includeMetadata
            ? { allCities, availableEvents }
            : undefined,
          data: formattedJobs,
        });
      }
    }

    // Handle regular pagination (non-filtered jobs)
    if (isPaginated && tabType !== "nav-chats") {
      const [jobsResult, totalCount] = await Promise.all([
        jobsQuery.skip(skip).limit(limitNum).lean(),
        Job.countDocuments(query),
      ]);

      jobs = jobsResult;
      totalJobs = totalCount;

      const totalPages = Math.ceil(totalJobs / limitNum);

      // Get applied status for these jobs in batch
      const jobIds = jobs.map((job) => job._id);
      const appliedJobsMap = await getAppliedJobsMap(jobIds, resId);

      const formattedJobs = jobs.map((job) => ({
        name: job?.name,
        peopleRange: job?.peopleRange,
        budget: job?.budget,
        eventType: job?.eventType,
        eventDateOptions: job?.eventDateOptions,
        selectedCities: job?.selectedCities,
        variants: job?.variants?.map((variant) => variant?.variant_id),
        _id: job?._id,
        radius: job?.radius,
        publishedAt: job?.publishedAt,
        specialRequirements: job?.specialRequirements,
        status: job?.status,
        budgetType: job?.budgetType,
        matchedPercentage: job?.matched?.[0]?.[0]?.venue_matches || [],
        cuisines: job?.cuisines,
        isSaved: job?.isSaved,
        userId: job?.userId,
        isApplied: appliedJobsMap.get(job._id.toString()) || false,
      }));

      return res.status(200).json({
        success: true,
        count: totalJobs,
        pagination: {
          currentPage: pageNum,
          totalPages,
          pageSize: limitNum,
          totalItems: totalJobs,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
        metadata: includeMetadata ? { allCities, availableEvents } : undefined,
        data: formattedJobs,
      });
    } else {
      // No pagination
      jobs = await jobsQuery.lean();

      // Get applied status for these jobs in batch
      const jobIds = jobs.map((job) => job._id);
      const appliedJobsMap = await getAppliedJobsMap(jobIds, resId);

      const formattedJobs = jobs.map((job) => ({
        name: job?.name,
        peopleRange: job?.peopleRange,
        budget: job?.budget,
        eventType: job?.eventType,
        eventDateOptions: job?.eventDateOptions,
        selectedCities: job?.selectedCities,
        variants: job?.variants?.map((variant) => variant?.variant_id),
        _id: job?._id,
        radius: job?.radius,
        publishedAt: job?.publishedAt,
        specialRequirements: job?.specialRequirements,
        status: job?.status,
        budgetType: job?.budgetType,
        matchedPercentage: job?.matched?.[0]?.[0]?.venue_matches || [],
        cuisines: job?.cuisines,
        isSaved: job?.isSaved,
        userId: job?.userId,
        isApplied: appliedJobsMap.get(job._id.toString()) || false,
      }));

      return res.status(200).json({
        success: true,
        count: formattedJobs.length,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          pageSize: formattedJobs.length,
          totalItems: formattedJobs.length,
          hasNextPage: false,
          hasPrevPage: false,
        },
        metadata: includeMetadata ? { allCities, availableEvents } : undefined,
        data: formattedJobs,
      });
    }
  } catch (error) {
    console.error("Error in getJobsController:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
// Get job by ID
const getJobByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid job ID",
      });
    }
    const job = await Job.findById(id)
      .populate("userId", "userName")
      .populate("eventType", "eventName")
      .populate("cuisines", "name")
      .populate("services")
      .populate(
        "restaurant_id",
        "restaurantName email phoneNumber location district streetAddress state image "
      )
      .populate("menuSections.category", "name")
      .populate("menuSections.items.item", "name description")
      .populate({
        path: "variants.variant_id",
        populate: [
          {
            path: "menuItems",
            select: "name description",
          },
          {
            path: "freeServices",
            select: "name description",
          },
          {
            path: "paidServices",
            select: "name description",
          },
          {
            path: "packageId",
            populate: {
              path: "venueId",
              select:
                "restaurantName email phoneNumber location district streetAddress state image mediaUrl bannerUrl",
            },
          },
          {
            path: "packageId",
            populate: {
              path: "eventType",
              select: "eventName",
            },
          },
        ],
      });
    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update job
const updateJobController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid job ID",
      });
    }

    const oldJob = await Job.findById(id);
    if (!oldJob) {
      return res.status(404).json({
        success: false,
        error: "Job not found",
      });
    }

    // Update createdAt only if status is changing from Draft → Active
    if (oldJob.status === "Draft" && updateData.status === "Active") {
      updateData.publishedAt = new Date();
    }

    const job =
      updateData?.status === "Draft"
        ? await Job.findByIdAndUpdate(id, updateData, { new: true })
        : await Job.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
          })
            .populate("userId", "userName email phoneNumber")
            .populate("eventType", "eventName")
            .populate("cuisines", "name")
            .populate("services")
            .populate("restaurant_id", "restaurantName email phoneNumber")
            .populate("menuSections.category", "name")
            .populate("menuSections.items.item", "name description")
            .populate("variants.variant_id");

    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete job
const deleteJobController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid job ID",
      });
    }

    const job = await Job.findByIdAndDelete(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get user's jobs
const getUserJobsController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    if (!validateObjectId(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID",
      });
    }

    const jobQuery = { userId };
    if (status) {
      jobQuery.status = status;
    }

    let jobs = await Job.find(jobQuery)
      .populate("userId", "userName email phoneNumber")
      .populate("eventType", "eventName")
      .populate("cuisines", "name")
      .populate("services")
      .populate("restaurant_id", "restaurantName email phoneNumber")
      .populate("menuSections.category", "name")
      .populate("menuSections.items.item", "name description basePrice")
      .sort({ publishedAt: -1 });

    // Add numberOfProposals with error isolation
    const enrichedJobs = await Promise.all(
      jobs.map(async (job) => {
        try {
          const variantIds = job.variants
            .map((v) => v.variant_id)
            .filter(Boolean);

          if (!variantIds.length) {
            return { ...job.toObject(), numberOfProposals: 0 };
          }

          const variants = await Variant.find({
            _id: { $in: variantIds },
          }).select("packageId");

          const packageIds = variants.map((v) => v.packageId).filter(Boolean);

          if (!packageIds.length) {
            return { ...job.toObject(), numberOfProposals: 0 };
          }

          const packages = await Package.find({
            _id: { $in: packageIds },
          }).select("venueId");

          const venueIds = packages
            .map((p) => p.venueId?.toString())
            .filter(Boolean);

          const uniqueVenueIds = [...new Set(venueIds)];

          return {
            ...job.toObject(),
            numberOfProposals: uniqueVenueIds.length,
          };
        } catch (err) {
          console.error(`Failed to enrich job ${job._id}:`, err);
          return {
            ...job.toObject(),
            numberOfProposals: 0, // fallback on error
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedJobs.length,
      data: enrichedJobs,
    });
  } catch (error) {
    console.error("getUserJobsController error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

const inviteVendorController = async (req, res) => {
  try {
    const { vendorId, userId, jobId } = req.body;

    // Check if the notification already exists
    const existingNotification = await Notification.findOne({
      from_id: userId,
      to_ids: vendorId, // Assuming vendorId is a single value and not an array in the query
      "metadata.jobId": jobId,
    });

    if (existingNotification) {
      return res.status(400).json({
        success: false,
        message: "Invitation already sent to the venue.",
      });
    }

    // Fetch user details
    const user = await User.findById(userId);

    // Create new notification
    const newNotification = await Notification.create({
      from_id: userId,
      to_ids: [vendorId],
      notification_title: "New Invitation Received",
      notification_message: `You have received a new invitation from ${
        user?.userName || "user"
      }.`,
      action_link: "/job-notifications",
      metadata: {
        jobId: jobId,
      },
      priority: "medium",
    });
    const job = await Job.findByIdAndUpdate(
      jobId,
      { $push: { restaurant_id: vendorId } },
      { new: true }
    );
    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Job not found",
      });
    }
    // Emit socket event
    inviteVendor(vendorId, userId, jobId);

    return res.status(200).json({
      success: true,
      message: "Invitation sent successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const inviteVendorsController = async (req, res) => {
  try {
    const { vendorIds, userId } = req.body;
    const { jobId } = req.params;
    if (!Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid vendorIds. It should be a non-empty array.",
      });
    }

    // Check existing notifications to avoid duplicates
    const existingNotifications = await Notification.find({
      from_id: userId,
      to_ids: { $in: vendorIds },
      "metadata.jobId": jobId,
    });

    const alreadyInvitedVendorIds = existingNotifications.map(
      (notif) => notif.to_ids[0]
    );
    const newVendorIds = vendorIds.filter(
      (id) => !alreadyInvitedVendorIds.includes(id)
    );

    if (newVendorIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invitations already sent to all selected vendors.",
      });
    }

    // Fetch user details
    const user = await User.findById(userId);
    const userName = user?.userName || "user";

    // Create new notifications for non-invited vendors
    const notifications = newVendorIds.map((vendorId) => ({
      from_id: userId,
      to_ids: [vendorId],
      notification_title: "New Invitation Received",
      notification_message: `You have received a new invitation from ${userName}.`,
      action_link: "/job-notifications",
      metadata: { jobId },
      priority: "medium",
    }));

    await Notification.insertMany(notifications);

    // Update the job with invited vendorIds
    const job = await Job.findByIdAndUpdate(
      jobId,
      { $addToSet: { restaurant_id: { $each: newVendorIds } } },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    // Emit socket events for each vendor
    newVendorIds.forEach((vendorId) => {
      inviteVendor(vendorId, userId, jobId);
    });

    return res.status(200).json({
      success: true,
      message: "Invitations sent successfully.",
      invitedVendors: newVendorIds,
      alreadyInvitedVendors: alreadyInvitedVendorIds,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getJobInvitesController = async (req, res) => {
  try {
    const { resId } = req.params;
    if (!validateObjectId(resId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid restaurant ID",
      });
    }

    const jobs = await Job.find({ restaurant_id: { $in: resId } })
      .populate("userId", "userName email phoneNumber")
      .populate("restaurant_id", "restaurantName email phoneNumber")
      .populate("menuSections.category", "name")
      .populate("menuSections.items.item", "name description")
      .populate({
        path: "variants.variant_id",
        populate: [
          { path: "menuItems", select: "name description" },
          { path: "freeServices", select: "name description" },
          { path: "paidServices", select: "name description" },
        ],
      });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
// Get jobs by restaurant
const getRestaurantJobsController = async (req, res) => {
  try {
    const { restaurant_id } = req.params;

    if (!validateObjectId(restaurant_id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid restaurant ID",
      });
    }

    const jobs = await Job.find({ restaurant_id })
      .populate("userId", "userName email phoneNumber")
      .populate("restaurant_id", "restaurantName email phoneNumber")
      .populate("menuSections.category", "name")
      .populate("menuSections.items.item", "name description")
      .populate("variants.variant_id")
      .sort({ eventDate: 1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update variant status
const updateVariantStatusController = async (req, res) => {
  try {
    const { jobId, variantId } = req.params;
    const { isShortlisted, isRejected, customRequirements = [] } = req.body;

    if (!validateObjectId(jobId) || !validateObjectId(variantId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid job ID or variant ID",
      });
    }

    const job = await Job.findOneAndUpdate(
      {
        _id: jobId,
        "variants.variant_id": variantId,
      },
      {
        $set: {
          "variants.$.isShortlisted": isShortlisted,
          "variants.$.isRejected": isRejected,
          "variants.$.customRequirements": customRequirements,
        },
      },
      { new: true }
    )
      .populate("userId", "userName email phoneNumber")
      .populate("restaurant_id", "restaurantName email phoneNumber")
      .populate("menuSections.category", "name")
      .populate("menuSections.items.item", "name description")
      .populate("variants.variant_id");

    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Job or variant not found",
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const addVariantsToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { variantIds, resId } = req.body;

    // Validate input
    if (!variantIds || !Array.isArray(variantIds)) {
      return res.status(400).json({
        success: false,
        message: "variantIds must be a non-empty array",
      });
    }

    if (!resId) {
      return res.status(400).json({
        success: false,
        message: "resId is required",
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Get existing variant IDs from the job's variants array
    const oldVariantIds = job.variants.map((variant) =>
      variant.variant_id.toString()
    );
    const incomingVariantIds = variantIds.map((id) => id.toString());

    // New variants to add (in incoming list but not in existing)
    const newVariantIdsToAdd = incomingVariantIds.filter(
      (id) => !oldVariantIds.includes(id)
    );

    // Variants to remove (in existing but not in incoming list)
    const variantIdsToRemove = oldVariantIds.filter(
      (id) => !incomingVariantIds.includes(id)
    );

    // Remove variants from job's variants array
    job.variants = job.variants.filter(
      (variant) => !variantIdsToRemove.includes(variant.variant_id.toString())
    );
    await Variant.deleteMany({ _id: { $in: variantIdsToRemove } });

    //Added restaurant to job while suggesting if it is not invited.
    if (!job.restaurant_id?.includes(resId)) {
      job.restaurant_id.push(resId);
    }

    // Create new variant objects to add to the job
    const newVariants = newVariantIdsToAdd.map((variantId) => ({
      variant_id: variantId,
      isShortlisted: false,
      isRejected: false,
      autoApply: req.autoApply || false,
    }));

    // Add new variants to the job's variants array
    job.variants.push(...newVariants);

    // If this is an auto-apply, add to autoAppliedRestaurants
    if (req.autoApply) {
      // Get the match percentage from the job's matches
      const matches = job.matched?.[0]?.[0]?.matches || [];
      const restaurantMatches = matches.filter(
        (match) => match.venue_id === resId
      );
      const maxMatchPercentage = Math.max(
        ...restaurantMatches.map((match) => match.match_percentage || 0)
      );

      // Only add if not already in autoAppliedRestaurants
      const alreadyAutoApplied = job.autoAppliedRestaurants?.some(
        (entry) => entry.restaurantId.toString() === resId
      );

      if (!alreadyAutoApplied) {
        if (!job.autoAppliedRestaurants) {
          job.autoAppliedRestaurants = [];
        }

        job.autoAppliedRestaurants.push({
          restaurantId: resId,
          appliedAt: new Date(),
          matchPercentage: maxMatchPercentage,
        });
      }
    }

    // Save the updated job
    const updatedJob = await job.save();

    // Create notification only if new variants were added
    let newNotification = null;
    if (newVariants.length > 0) {
      try {
        const restaurant = await Restaurant.findById(resId);

        newNotification = new Notification({
          from_id: resId,
          to_ids: [job.userId],
          notification_title: "Suggestion Received",
          notification_message: restaurant?.restaurantName
            ? `${restaurant.restaurantName} has sent you a suggestion for a job.`
            : "Restaurant has sent you a suggestion for a job.",
          action_link: "/job-notifications",
          metadata: { jobId, resId },
        });

        await newNotification.save();

        await suggestionNotification(job.userId, {
          jobId,
          resId,
        });
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
        // Don't fail the entire operation if notification fails
      }
    }
    if (newVariants.length === 0) {
      await suggestionRemoved(job.userId, { jobId, resId });
    }

    return res.status(200).json({
      success: true,
      message: "Variants updated successfully",
      data: updatedJob,
      notification: newNotification,
    });
  } catch (error) {
    console.error("Error adding variants to job:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating variants",
      error: error.message,
    });
  }
};

const maskAsSaved = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { data } = req.body;

    // Combine update and populate in a single database operation
    const populatedJob = await Job.findOneAndUpdate(
      { _id: jobId },
      { $push: { isSaved: data } },
      { new: true }
    ).select("isSaved");

    if (!populatedJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job marked as saved successfully", // Fixed typo in message from "masked" to "marked"
      data: populatedJob,
    });
  } catch (error) {
    console.error("Error marking as saved:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while marking as saved",
      error: error.message,
    });
  }
};
const removeFromSaved = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { data } = req.body;

    // Combine the update and populate operations to reduce database calls
    const populatedJob = await Job.findOneAndUpdate(
      { _id: jobId },
      { $pull: { isSaved: data } },
      { new: true }
    ).select("isSaved");

    if (!populatedJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job removed from saved successfully",
      data: populatedJob,
    });
  } catch (error) {
    console.error("Error removing from saved:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while removing from saved",
      error: error.message,
    });
  }
};

const getJobsWithConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || !validateObjectId(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid userId provided",
      });
    }

    const conversations = await Job.aggregate(
      [
        // Match early to reduce dataset size
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            status: "Active",
          },
        },
        // Lookup chats with filtering
        {
          $lookup: {
            from: "chats",
            localField: "_id",
            foreignField: "jobId",
            pipeline: [
              // Sort within the lookup to use indexes
              { $sort: { createdAt: 1 } },
            ],
            as: "chats",
          },
        },
        // Filter only jobs with conversations
        {
          $match: {
            chats: { $not: { $size: 0 } },
          },
        },
        // Unwind chats
        {
          $unwind: {
            path: "$chats",
          },
        },
        // Determine the other participant
        {
          $addFields: {
            otherParticipantId: {
              $cond: {
                if: {
                  $eq: ["$chats.senderId", new mongoose.Types.ObjectId(userId)],
                },
                then: "$chats.receiverId",
                else: "$chats.senderId",
              },
            },
          },
        },
        // Lookup restaurant details
        {
          $lookup: {
            from: "restaurants",
            localField: "otherParticipantId",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  restaurantName: 1,
                  image: 1,
                },
              },
            ],
            as: "restaurantDetails",
          },
        },
        {
          $unwind: "$restaurantDetails",
        },
        // Group by job and restaurant (messages already sorted from lookup)
        {
          $group: {
            _id: {
              jobId: "$_id",
              restaurantId: "$otherParticipantId",
            },
            job: {
              $first: {
                _id: "$_id",
                name: "$name",
                status: "$status",
                serviceType: "$serviceType",
                eventType: "$eventType",
                userId: "$userId",
              },
            },
            restaurant: { $first: "$restaurantDetails" },
            messages: {
              $push: {
                _id: "$chats._id",
                senderId: "$chats.senderId",
                receiverId: "$chats.receiverId",
                message: "$chats.message",
                read: "$chats.read",
                createdAt: "$chats.createdAt",
                sender: "$chats.sender",
              },
            },
          },
        },
        // Group conversations by job
        {
          $group: {
            _id: "$_id.jobId",
            jobDetails: { $first: "$job" },
            conversations: {
              $push: {
                restaurant: "$restaurant",
                messages: "$messages",
                totalMessages: { $size: "$messages" },
              },
            },
          },
        },
        // Populate eventType
        {
          $lookup: {
            from: "events",
            localField: "jobDetails.eventType",
            foreignField: "_id",
            as: "jobDetails.eventType",
          },
        },
        {
          $unwind: "$jobDetails.eventType",
        },
        // Final projection
        {
          $project: {
            _id: 0,
            job: "$jobDetails",
            conversations: 1,
          },
        },
      ],
      {
        allowDiskUse: true, // Enable external sorting
        maxTimeMS: 30000, // Add timeout for safety
      }
    );

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Error in getJobsWithConversations:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const shortlistVariant = async (req, res) => {
  const { jobId, variantId } = req.params;

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const variant = job.variants.find(
      (v) => v.variant_id.toString() === variantId
    );
    if (!variant)
      return res.status(404).json({ message: "Variant not found in job" });

    variant.isShortlisted = !variant.isShortlisted;
    variant.isRejected = false; // un-reject if previously rejected

    await job.save();
    res.json({ message: "Variant shortlisted successfully", variant });
  } catch (err) {
    console.error("Shortlist Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const rejectVariant = async (req, res) => {
  const { jobId, variantId } = req.params;

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const variant = job.variants.find(
      (v) => v.variant_id.toString() === variantId
    );
    if (!variant)
      return res.status(404).json({ message: "Variant not found in job" });

    variant.isRejected = !variant.isRejected;
    variant.isShortlisted = false; // un-shortlist if previously shortlisted

    await job.save();
    res.json({ message: "Variant rejected successfully", variant });
  } catch (err) {
    console.error("Reject Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createJobController,
  getJobsController,
  getJobByIdController,
  updateJobController,
  deleteJobController,
  getUserJobsController,
  inviteVendorController,
  inviteVendorsController,
  getRestaurantJobsController,
  updateVariantStatusController,
  getJobInvitesController,
  addVariantsToJob,
  maskAsSaved,
  removeFromSaved,
  getJobsWithConversations,
  shortlistVariant,
  rejectVariant,
  getAllFilteredJobs,
};
