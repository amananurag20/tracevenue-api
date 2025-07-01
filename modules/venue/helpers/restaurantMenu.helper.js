const Package = require("../models/package.model");
const restaurantMenuModel = require("../models/restaurantMenu.model");
const Variant = require("../models/variant.model");

function filterDisabledItems({
  menuData,
  disabledCategories = [],
  disabledItems = [],
  disabledSubCategories = [],
}) {
  // Step 1: Check if menuData is a valid array
  if (!Array.isArray(menuData)) {
    console.error("menuData is not an array");
    return [];
  }

  // Step 2: Deep clone to avoid mutating original data
  const clonedMenuData = JSON.parse(JSON.stringify(menuData));

  // Step 3: Process each category
  clonedMenuData.forEach((category) => {
    // Step 4: Check if category is in disabledCategories
    const isCategoryDisabled = disabledCategories.includes(category.categoryId);

    // If the category is in the disabledCategories, mark all items and subcategories as disabled
    if (isCategoryDisabled) {
      category.disabled = true;

      // Disable all items in this category
      if (Array.isArray(category.items)) {
        category.items.forEach((item) => {
          item.disabled = true;
        });
      }

      // Disable all subcategories and their items
      if (category.subcategoriesByCuisine) {
        Object.keys(category.subcategoriesByCuisine).forEach((cuisine) => {
          category.subcategoriesByCuisine[cuisine].forEach((subcategory) => {
            subcategory.disabled = true;
            if (Array.isArray(subcategory.items)) {
              subcategory.items.forEach((item) => {
                item.disabled = true;
              });
            }
          });
        });
      }
    } else {
      // If the category is not in disabledCategories, mark all items and subcategories as enabled (or remove the disabled flag)
      category.disabled = false;

      // Enable all items in this category
      if (Array.isArray(category.items)) {
        category.items.forEach((item) => {
          item.disabled = disabledItems.includes(item.id) ? true : false; // Disable if the item is in disabledItems
        });
      }

      // Enable all subcategories and their items
      if (category.subcategoriesByCuisine) {
        Object.keys(category.subcategoriesByCuisine).forEach((cuisine) => {
          category.subcategoriesByCuisine[cuisine].forEach((subcategory) => {
            const isSubcategoryDisabled = disabledSubCategories.includes(
              subcategory.subcategoryId
            );

            // If the subcategory is disabled, mark all its items as disabled
            subcategory.disabled = isSubcategoryDisabled;
            if (Array.isArray(subcategory.items)) {
              subcategory.items.forEach((item) => {
                // If the subcategory or item is in the disabled list, mark as disabled
                item.disabled =
                  isSubcategoryDisabled || disabledItems.includes(item.id);
              });
            }
          });
        });
      }
    }

    // Handle direct items for categories that are not disabled
    if (Array.isArray(category.items)) {
      category.items.forEach((item) => {
        // Mark item as disabled if it's in the disabledItems list
        if (disabledItems.includes(item.id)) {
          item.disabled = true;
        }
      });
    }
  });

  return clonedMenuData;
}
// Utility function to update category and subcategory counts, starting from items
/**
 * REQUIREMENTS SPECIFICATION:
 *
 * 1. Category Structure Validation:
 *    - category.total ≤ category.count (sum) + all enabled subcategories.total (sum)
 *    - category.count is INDEPENDENT of subcategory.count
 *    - category.count should reflect actual enabled items directly under category for each itemType
 *
 * 2. Subcategory Structure Validation:
 *    - subcategory.total ≤ subcategory.count (sum)
 *    - subcategory.count should reflect actual enabled items in that subcategory for each itemType
 *
 * 3. Count Calculation Rules:
 *    - For category: count based ONLY on enabled items directly under category.items
 *    - For subcategory: count based ONLY on enabled items in subcategory.items
 *    - If all items of an itemType are disabled, count for that itemType should be 0
 *
 * 4. Disabled Item Handling:
 *    - If category is disabled: no changes to counts/totals
 *    - If subcategory is disabled: exclude from category total calculation
 *    - If item is disabled: exclude from all count calculations
 *
 * 5. Total Calculation:
 *    - Category total = sum of enabled subcategory totals (category items don't add to total)
 *    - Subcategory total = count of enabled items in that subcategory
 */

// Alternative approach: Store original state in each object
const updateCategoryAndSubcategoryCounts = (data) => {
  return data.map((category) => {
    // Store original state if not already stored
    if (!category._original) {
      category._original = {
        count: { ...category.count },
        total: category.total,
      };

      // Store original state for subcategories
      Object.keys(category.subcategoriesByCuisine || {}).forEach((cuisine) => {
        category.subcategoriesByCuisine[cuisine].forEach((subcategory) => {
          if (!subcategory._original) {
            subcategory._original = {
              count: { ...subcategory.count },
              total: subcategory.total,
            };
          }
        });
      });
    }

    const originalCategory = category._original;

    // Test case 1: If category is disabled, keep original counts
    if (category.disabled) {
      return {
        ...category,
        count: { ...originalCategory.count },
        total: originalCategory.total,
      };
    }

    // Test case 2: Calculate enabled items at category level
    const enabledCategoryItems = (category.items || []).filter(
      (item) => item.disabled !== true
    );
    const enabledCategoryItemsByType = {};

    enabledCategoryItems.forEach((item) => {
      (item.itemTypes || []).forEach((type) => {
        enabledCategoryItemsByType[type] =
          (enabledCategoryItemsByType[type] || 0) + 1;
      });
    });

    // Calculate new category counts
    const newCategoryCount = {};
    let categoryTotalReduction = 0;

    Object.keys(originalCategory.count).forEach((type) => {
      const originalCount = originalCategory.count[type];
      const enabledCount = enabledCategoryItemsByType[type] || 0;

      if (enabledCount >= originalCount) {
        // No change needed
        newCategoryCount[type] = originalCount;
      } else {
        // Reduce count and track total reduction
        newCategoryCount[type] = enabledCount;
        categoryTotalReduction += originalCount - enabledCount;
      }
    });

    let subcategoryTotalReduction = 0;

    // Test case 3 & 4: Process subcategories
    Object.keys(category.subcategoriesByCuisine || {}).forEach((cuisine) => {
      const subcategories = category.subcategoriesByCuisine[cuisine];

      subcategories.forEach((subcategory) => {
        const originalSubcategory = subcategory._original;

        // Test case 4: If subcategory is disabled, keep original counts but reduce from category total
        if (subcategory.disabled) {
          subcategory.count = { ...originalSubcategory.count };
          subcategory.total = originalSubcategory.total;
          subcategoryTotalReduction += originalSubcategory.total;
          return;
        }

        // Test case 3: Calculate enabled items in subcategory
        const enabledSubcategoryItems = (subcategory.items || []).filter(
          (item) => item.disabled !== true
        );
        const enabledSubcategoryItemsByType = {};

        enabledSubcategoryItems.forEach((item) => {
          (item.itemTypes || []).forEach((type) => {
            enabledSubcategoryItemsByType[type] =
              (enabledSubcategoryItemsByType[type] || 0) + 1;
          });
        });

        // Calculate new subcategory counts
        const newSubcategoryCount = {};
        let subcategoryCountReduction = 0;

        Object.keys(originalSubcategory.count).forEach((type) => {
          const originalCount = originalSubcategory.count[type];
          const enabledCount = enabledSubcategoryItemsByType[type] || 0;

          if (enabledCount >= originalCount) {
            // No change needed
            newSubcategoryCount[type] = originalCount;
          } else {
            // Reduce count and track reduction
            newSubcategoryCount[type] = enabledCount;
            subcategoryCountReduction += originalCount - enabledCount;
          }
        });

        // Update subcategory
        subcategory.count = newSubcategoryCount;

        // If there was count reduction, reduce subcategory total
        if (subcategoryCountReduction > 0) {
          subcategory.total = Math.max(
            0,
            originalSubcategory.total - subcategoryCountReduction
          );
          subcategoryTotalReduction += subcategoryCountReduction;
        } else {
          subcategory.total = originalSubcategory.total;
        }
      });
    });

    // Calculate final category total
    const newCategoryTotal =
      originalCategory.total -
      categoryTotalReduction -
      subcategoryTotalReduction;

    return {
      ...category,
      count: newCategoryCount,
      total: Math.max(0, newCategoryTotal),
    };
  });
};

async function updateVariantsBasedOnDisabledItems(restaurantId) {
  try {
    // Find the restaurant menu by restaurantId
    const restaurantMenu = await restaurantMenuModel.findOne({ restaurantId });
    if (!restaurantMenu) {
      console.log("Restaurant menu not found!");
      return;
    }

    const { disabledCategories, disabledItems, disabledSubCategories } =
      restaurantMenu;

    // Fetch packages for the restaurant
    const packages = await Package.find({ venueId: restaurantId });
    const packageIds = packages?.map((pkg) => pkg?._id) || []; // Safe mapping of packageIds

    if (packageIds.length === 0) {
      console.log("No packages found for the restaurant.");
      return;
    }

    // Find variants where packageId matches and jobSpecificId is null or not present
    const variants = await Variant.find({
      packageId: { $in: packageIds },
      jobSpecificId: { $in: [null, undefined] }, // Matching jobSpecificId being null or undefined
    });

    if (variants.length === 0) {
      console.log("No variants found for the given restaurant.");
      return;
    }

    // Process each variant
    for (let variant of variants) {
      try {
        // Assuming variant.availableMenuCount contains the menu data
        const filteredMenuData = filterDisabledItems({
          menuData: variant.availableMenuCount, // The menu data in the variant
          disabledCategories,
          disabledItems,
          disabledSubCategories,
        });

        if (!filteredMenuData || filteredMenuData.length === 0) {
          console.log(
            `No valid menu data after filtering for variant ${variant._id}.`
          );
          continue;
        }

        // Update the category and subcategory counts based on the filtered menu data
        const updatedMenuData = updateCategoryAndSubcategoryCounts(
          filteredMenuData,
          variant.availableMenuCount
        );

        // If updatedMenuData is empty, skip saving it to avoid unnecessary writes
        if (!updatedMenuData || updatedMenuData.length === 0) {
          console.log(`No updated menu data for variant ${variant._id}.`);
          continue;
        }

        // Update the variant with the new availableMenuCount
        variant.availableMenuCount = updatedMenuData;
        await variant.save(); // Saving the updated variant

        console.log(
          `Updated variant ${variant._id} with new availableMenuCount.`
        );
      } catch (variantError) {
        console.error(`Error processing variant ${variant._id}:`, variantError);
      }
    }
  } catch (error) {
    console.error("Error updating variants:", error);
  }
}
function filterOutDisabledItems(data) {
  // Handle null/undefined/non-array data
  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data
    .filter((category) => category != null && typeof category === "object") // Filter out null/undefined/non-object categories
    .map((category) => {
      try {
        // Add null checks and default values for category properties
        const subcategoriesByCuisine = category.subcategoriesByCuisine || {};
        const items = category.items || [];

        // Ensure subcategoriesByCuisine is an object
        if (
          typeof subcategoriesByCuisine !== "object" ||
          Array.isArray(subcategoriesByCuisine)
        ) {
          console.warn("subcategoriesByCuisine is not an object");
        }

        // Process subcategories by cuisine
        const cleanedSubcategoriesByCuisine = Object.keys(
          subcategoriesByCuisine
        ).reduce((acc, cuisine) => {
          try {
            const subcategoryArray = subcategoriesByCuisine[cuisine];

            // Ensure subcategoryArray is actually an array
            if (!Array.isArray(subcategoryArray)) {
              return acc;
            }

            const filteredSubcategories = subcategoryArray.filter(
              (subcategory) =>
                subcategory &&
                typeof subcategory === "object" &&
                !subcategory.disabled
            );

            // Only keep the cuisine if it has active subcategories
            if (filteredSubcategories.length > 0) {
              acc[cuisine] = filteredSubcategories
                .map((subcategory) => {
                  try {
                    // Clean subcategory and remove disabled and _original fields if they exist
                    const cleanedSubcategory = { ...subcategory };
                    if ("disabled" in cleanedSubcategory)
                      delete cleanedSubcategory.disabled;
                    if ("_original" in cleanedSubcategory)
                      delete cleanedSubcategory._original;

                    // Add null check for subcategory items
                    const subcategoryItems = subcategory.items || [];

                    // Ensure subcategoryItems is an array
                    if (Array.isArray(subcategoryItems)) {
                      cleanedSubcategory.items = subcategoryItems
                        .filter(
                          (item) =>
                            item && typeof item === "object" && !item.disabled
                        )
                        .map((item) => {
                          try {
                            // Clean each item and remove disabled and _original fields if they exist
                            const cleanedItem = { ...item };
                            if ("disabled" in cleanedItem)
                              delete cleanedItem.disabled;
                            if ("_original" in cleanedItem)
                              delete cleanedItem._original;
                            return cleanedItem;
                          } catch (itemError) {
                            console.warn(
                              "Error processing subcategory item:",
                              itemError
                            );
                            return null;
                          }
                        })
                        .filter((item) => item !== null);
                    } else {
                      cleanedSubcategory.items = [];
                    }

                    return cleanedSubcategory;
                  } catch (subcategoryError) {
                    console.warn(
                      "Error processing subcategory:",
                      subcategoryError
                    );
                    return null;
                  }
                })
                .filter((subcategory) => subcategory !== null);
            }

            return acc;
          } catch (cuisineError) {
            console.warn(`Error processing cuisine ${cuisine}:`, cuisineError);
            return acc;
          }
        }, {});

        // Process category-level items
        let cleanedItems = [];
        if (Array.isArray(items)) {
          cleanedItems = items
            .filter(
              (item) => item && typeof item === "object" && !item.disabled
            )
            .map((item) => {
              try {
                // Clean each item and remove disabled and _original fields if they exist
                const cleanedItem = { ...item };
                if ("disabled" in cleanedItem) delete cleanedItem.disabled;
                if ("_original" in cleanedItem) delete cleanedItem._original;
                return cleanedItem;
              } catch (itemError) {
                console.warn("Error processing category item:", itemError);
                return null;
              }
            })
            .filter((item) => item !== null);
        }

        // Check if category should be kept (has items OR has active subcategories)
        const hasActiveSubcategories =
          Object.keys(cleanedSubcategoriesByCuisine).length > 0;
        const hasActiveItems = cleanedItems.length > 0;

        if (hasActiveSubcategories || hasActiveItems) {
          // Create cleaned category without disabled and _original fields if they exist
          const cleanedCategory = { ...category };
          if ("disabled" in cleanedCategory) delete cleanedCategory.disabled;
          if ("_original" in cleanedCategory) delete cleanedCategory._original;

          return {
            ...cleanedCategory,
            items: cleanedItems,
            subcategoriesByCuisine: cleanedSubcategoriesByCuisine,
          };
        }

        return null; // Return null if category is entirely disabled or empty
      } catch (categoryError) {
        console.warn("Error processing category:", categoryError);
        return null;
      }
    })
    .filter((category) => category !== null); // Remove null categories
}
module.exports = {
  updateVariantsBasedOnDisabledItems,
  filterOutDisabledItems,
};
