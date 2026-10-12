import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, } from 'react-native';

const courses = ['Starter', 'Main Course', 'Dessert'] as const;

type Course = (typeof courses)[number];
type Page = 'add' | 'menu';

type MenuItem = {
  id: string;
  name: string;
  course: Course;
  description: string;
  price: number;
};

type FieldProps = {
  label: string; value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  returnKeyType?: 'next' | 'done';
};

const panel = {
  backgroundColor: '#fffdf9',
  borderWidth: 1,
  borderColor: '#e8e2d7',
};

const field = {
  backgroundColor: '#fbfaf6',
  borderWidth: 1,
  borderColor: '#dddcd2',
  borderRadius: 10,
};

const center = {
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

const muted = {
  color: '#748078',
  fontSize: 14,
  lineHeight: 20,
};

function Field({
  label,
  value,
  placeholder,
  onChangeText,
  multiline = false,
  returnKeyType,
}: FieldProps) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label.replace(' *', '')}
        style={[styles.input, multiline && styles.multiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#89928b"
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        returnKeyType={returnKeyType}
      />
    </>
  );
}

function Button({
  label,
  onPress,
  outline = false,
}: {
  label: string;
  onPress: () => void;
  outline?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [outline ? styles.addAnother : styles.primaryButton, pressed && styles.pressed]}
    >
      <Text style={outline ? styles.addAnotherText : styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

export default function App() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [page, setPage] = useState<Page>('add');
  const [name, setName] = useState('');
  const [course, setCourse] = useState<Course | ''>('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [feedback, setFeedback] = useState({ text: '', isError: false });

  const clearFeedback = () => setFeedback({ text: '', isError: false });

  const updateField =
    (setValue: (value: string) => void) => (value: string) => {
      setValue(value);
      clearFeedback();
    };

  const addItem = () => {
    const dishName = name.trim();
    const amount = Number(price.trim());

    if (!dishName) {
      setFeedback({ text: 'Please enter a dish name.', isError: true });
      return;
    }

    if (!course) {
      setFeedback({ text: 'Please choose a course.', isError: true });
      return;
    }

    if (!price.trim()) {
      setFeedback({ text: 'Please enter a price in rands.', isError: true });
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(price.trim()) || !Number.isFinite(amount)) {
      setFeedback({
        text: 'Enter a valid price, such as 85.50.',
        isError: true,
      });
      return;
    }

    if (amount <= 0) {
      setFeedback({ text: 'Price must be greater than zero.', isError: true });
      return;
    }

    setItems((currentItems) => [
      {
        id: `${Date.now()}-${currentItems.length}`,
        name: dishName,
        course,
        description: description.trim(),
        price: amount,
      },
      ...currentItems,
    ]);

    setName('');
    setCourse('');
    setDescription('');
    setPrice('');
    setFeedback({
      text: `${dishName} has been added to your menu.`,
      isError: false,
    });
  };

  const isAddPage = page === 'add';

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>A TASTE OF SOMETHING SPECIAL</Text>
          <Text style={styles.brand}>Christoffel's Dining</Text>
          <Text style={styles.tagline}>Your menu, thoughtfully curated.</Text>
        </View>

        <View style={styles.navigation}>
          {(['add', 'menu'] as const).map((tab) => {
            const selected = page === tab;
            return (
              <Pressable
                key={tab}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setPage(tab)}
                style={[styles.navButton, selected && styles.navSelected]}
              >
                <Text style={[styles.navText, selected && styles.navTextSelected]}>
                  {tab === 'add' ? '＋  Add dish' : `Menu  (${items.length})`}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isAddPage ? (
          <View style={styles.card}>
            <Text style={styles.heading}>Create a menu item</Text>
            <Text style={styles.hint}>Name, course and price are required.</Text>

            <Field label="Dish name *" value={name} onChangeText={updateField(setName)} placeholder="e.g. Cape Malay curry" returnKeyType="next" />

            <Text style={styles.label}>Course *</Text>
            <View style={styles.courses}>
              {courses.map((option) => {
                const selected = course === option;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      setCourse(option);
                      clearFeedback();
                    }}
                    style={[styles.course, selected && styles.courseSelected]}
                  >
                    <Text style={[styles.courseText, selected && styles.courseTextSelected]}>{option}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Field label="Description" value={description} onChangeText={updateField(setDescription)} placeholder="Tell guests what makes it special" multiline />

            <Text style={styles.label}>Price in rands (R) *</Text>
            <View style={styles.priceBox}>
              <Text style={styles.rand}>R</Text>
              <TextInput
                accessibilityLabel="Price in rands"
                style={styles.priceInput}
                value={price}
                onChangeText={updateField(setPrice)}
                placeholder="0.00"
                placeholderTextColor="#89928b"
                keyboardType="decimal-pad"
                returnKeyType="done"
                onSubmitEditing={addItem}
              />
            </View>

            {feedback.text ? (
              <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.notice, feedback.isError ? styles.errorNotice : styles.successNotice]}>
                <Text style={feedback.isError ? styles.errorText : styles.successText}>{feedback.text}</Text>
              </View>
            ) : null}

            <Button label="Add to menu" onPress={addItem} />

            {items.length > 0 ? (
              <Pressable style={styles.textButton} onPress={() => setPage('menu')}>
                <Text style={styles.textButtonLabel}>View menu · {items.length}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View style={styles.menuPage}>
            <View style={styles.menuHeader}>
              <View>
                <Text style={styles.heading}>Our menu</Text>
                <Text style={styles.hint}>Made with care, served with pride.</Text>
              </View>
              <View style={styles.countBadge}><Text style={styles.countText}>{items.length}</Text></View>
            </View>

            {items.length > 0 ? (
              items.map((item) => (
                <View key={item.id} style={styles.menuCard}>
                  <View style={styles.dishTop}>
                    <View style={styles.dishTitleWrap}>
                      <Text style={styles.courseTag}>{item.course}</Text>
                      <Text style={styles.dishName}>{item.name}</Text>
                    </View>
                    <Text style={styles.dishPrice}>R {item.price.toFixed(2)}</Text>
                  </View>
                  {item.description ? <Text style={styles.dishDescription}>{item.description}</Text> : null}
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>✦</Text>
                <Text style={styles.emptyTitle}>A menu waiting to be made</Text>
                <Text style={styles.emptyText}>Add your first dish and it will appear here.</Text>
                <Button label="Add your first dish" onPress={() => setPage('add')} />
              </View>
            )}

            {items.length > 0 ? <Button label="＋  Add another dish" onPress={() => setPage('add')} outline /> : null}
          </View>
        )}

        <Text style={styles.footer}>CHRISTOFFEL'S DINING  ·  MADE WITH CARE</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f0e8',
  },
  content: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    padding: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: '#173f35',
    borderRadius: 22,
    padding: 25,
    marginBottom: 18,
  },
  eyebrow: {
    color: '#e4bd76',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  brand: {
    color: '#fffaf0',
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '800',
    marginTop: 9,
  },
  tagline: {
    color: '#d5e0d7',
    fontSize: 15,
    marginTop: 6,
  },
  navigation: {
    flexDirection: 'row',
    backgroundColor: '#e7e4db',
    padding: 5,
    borderRadius: 13,
    marginBottom: 18,
  },
  navButton: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  navSelected: {
    backgroundColor: '#fffdf8',
    elevation: 2,
  },
  navText: {
    color: '#67736b',
    fontSize: 14,
    fontWeight: '700',
  },
  navTextSelected: {
    color: '#1e5140',
  },
  card: {
    ...panel,
    borderRadius: 18,
    padding: 20,
  },
  heading: {
    color: '#203a31',
    fontSize: 21,
    fontWeight: '800',
  },
  hint: {
    ...muted,
    marginTop: 5,
  },
  label: {
    color: '#34483e',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 17,
    marginBottom: 7,
  },
  input: {
    ...field,
    minHeight: 48,
    color: '#203a31',
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 15,
  },
  courses: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  course: {
    ...field,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 13,
  },
  courseSelected: {
    backgroundColor: '#e5f0e8',
    borderColor: '#327258',
  },
  courseText: {
    color: '#526259',
    fontSize: 13,
    fontWeight: '600',
  },
  courseTextSelected: {
    color: '#1e5140',
    fontWeight: '800',
  },
  multiline: {
    minHeight: 78,
  },
  priceBox: {
    ...field,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },
  rand: {
    color: '#327258',
    fontSize: 16,
    fontWeight: '800',
  },
  priceInput: {
    flex: 1,
    color: '#203a31',
    fontSize: 15,
    paddingVertical: 11,
    paddingLeft: 9,
  },
  notice: {
    borderRadius: 9,
    padding: 11,
    marginTop: 14,
  },
  errorNotice: {
    backgroundColor: '#fff1ed',
    borderWidth: 1,
    borderColor: '#f3c9bd',
  },
  successNotice: {
    backgroundColor: '#eaf5ed',
    borderWidth: 1,
    borderColor: '#c4dfca',
  },
  errorText: {
    color: '#a23b2c',
    fontSize: 13,
    lineHeight: 19,
  },
  successText: {
    color: '#256044',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  primaryButton: {
    ...center,
    minHeight: 50,
    backgroundColor: '#bd6848',
    borderRadius: 11,
    marginTop: 19,
  },
  pressed: {
    opacity: 0.82,
  },
  primaryText: {
    color: '#fffaf5',
    fontSize: 15,
    fontWeight: '800',
  },
  textButton: {
    alignItems: 'center',
    paddingTop: 16,
  },
  textButtonLabel: {
    color: '#276047',
    fontSize: 14,
    fontWeight: '700',
  },
  menuPage: {
    gap: 11,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    marginBottom: 4,
  },
  countBadge: {
    ...center,
    minWidth: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e3ebdf',
  },
  countText: {
    color: '#285844',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyCard: {
    ...panel,
    alignItems: 'center',
    borderRadius: 18,
    padding: 24,
  },
  emptyIcon: {
    color: '#bd6848',
    fontSize: 28,
    marginBottom: 8,
  },
  emptyTitle: {
    color: '#203a31',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyText: {
    ...muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 7,
  },
  menuCard: {
    ...panel,
    borderRadius: 15,
    padding: 17,
  },
  dishTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  dishTitleWrap: {
    flex: 1,
  },
  courseTag: {
    color: '#327258',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  dishName: {
    color: '#203a31',
    fontSize: 17,
    fontWeight: '800',
  },
  dishPrice: {
    color: '#a95135',
    fontSize: 15,
    fontWeight: '800',
  },
  dishDescription: {
    ...muted,
    marginTop: 9,
  },
  addAnother: {
    ...center,
    minHeight: 49,
    borderWidth: 1,
    borderColor: '#327258',
    borderRadius: 11,
    marginTop: 4,
  },
  addAnotherText: {
    color: '#276047',
    fontSize: 14,
    fontWeight: '800',
  },
  footer: {
    color: '#92988f',
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginTop: 25,
  },
});
